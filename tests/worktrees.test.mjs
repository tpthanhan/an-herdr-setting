import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const source = new URL('../herdr/mods/space-agents-tree/', import.meta.url);
const asModule = text => `data:text/javascript;base64,${Buffer.from(text).toString('base64')}`;
const helpersUrl = asModule(await readFile(new URL('worktrees.js', source), 'utf8'));
const { parseWorktrees, pathKey, checkoutForFolder, unopenedWorktrees } = await import(helpersUrl);
const record = (path, fields = []) => [`worktree ${path}`, 'HEAD abcdef123', ...fields].join('\0') + '\0\0';

function element() {
  const node = { children: [], events: {} };
  let proxy;
  proxy = new Proxy(node, { get(target, key) {
    if (key in target) return target[key];
    if (key === 'child') return child => { target.children.push(child); return proxy; };
    if (key === 'when') return (condition, fn) => condition ? fn(proxy) : proxy;
    if (key === 'on_click') return fn => { target.events.click = fn; return proxy; };
    return () => proxy;
  } });
  return proxy;
}
const state = { spaces: [], panes: [], commands: [] };
globalThis.__herdrTreeTest = {
  View: class {}, div: element, svg: element, v_flex: element, h_flex: element,
  spaces: () => state.spaces, panes: () => state.panes,
  machines: () => [{ name: null, layout: 'ready' }],
  run: (...args) => state.commands.push(args),
  exec: async (command, args, options) => {
    try { return { code: 0, ...(await exec(command, args, { cwd: options.cwd })) }; }
    catch (error) { return { code: error.code, stdout: error.stdout, stderr: error.stderr }; }
  },
};
let main = await readFile(new URL('main.js', source), 'utf8');
main = main.replace(/import \{([^}]+)\} from "(?:gpui-kit|gpui-base|herdr)";/g, (_, names) => `const {${names}} = globalThis.__herdrTreeTest;`)
  .replace('from "./worktrees.js"', `from "${helpersUrl}"`);
const { default: Spaces } = await import(asModule(main + '\n//# sourceURL=space-agents-tree-main.js')); 

test('NUL porcelain preserves Unicode, spaces, newlines and detached/locked worktrees', () => {
  const checkouts = parseWorktrees(record('C:/repo', ['branch refs/heads/main'])
    + record('C:/work trees/设计\nline', ['detached', 'locked reason'])
    + record('C:/gone', ['prunable gitdir file points to non-existent location']));
  assert.equal(checkouts.length, 2);
  assert.equal(checkouts[0].main, true);
  assert.equal(checkouts[1].path, 'C:/work trees/设计\nline');
  assert.equal(checkouts[1].branch, null);
  assert.equal(checkouts[1].locked, true);
});

test('bare repositories do not incorrectly mark the first linked checkout as main', () => {
  const checkouts = parseWorktrees('worktree /bare.git\0bare\0\0' + record('/linked', ['detached']));
  assert.equal(unopenedWorktrees(checkouts, [], '').length, 1);
});

test('Windows path equivalence, Unix case sensitivity and deepest checkout matching', () => {
  assert.equal(pathKey('C:\\Repo\\'), pathKey('c:/repo'));
  assert.notEqual(pathKey('/Repo'), pathKey('/repo'));
  const checkouts = parseWorktrees(record('C:/Repo', ['branch refs/heads/main']) + record('C:/Repo/trees/feature'));
  assert.equal(checkoutForFolder(checkouts, 'c:\\REPO\\trees\\feature\\src').path, 'C:/Repo/trees/feature');
  assert.equal(checkoutForFolder(checkouts, 'C:/Repository'), null);
  assert.deepEqual(unopenedWorktrees(checkouts, ['c:\\repo\\trees\\feature\\src'], 'C:/Repo'), []);
  assert.equal(unopenedWorktrees(checkouts, ['C:/Repo'], 'C:/Repo').length, 1);
});

test('real existing Git worktrees are discovered without creating spaces; click opens or selects', async () => {
  const root = await mkdtemp(join(tmpdir(), 'herdr-worktree-test-'));
  try {
    const repo = join(root, 'repo');
    const linked = join(root, 'existing worktree');
    await exec('git', ['init', repo]);
    const git = args => exec('git', ['-C', repo, ...args]);
    await git(['-c', 'user.name=Herdr Test', '-c', 'user.email=test@example.invalid', 'commit', '--allow-empty', '-m', 'fixture']);
    await git(['worktree', 'add', '--detach', linked, 'HEAD']);
    const view = new Spaces();
    Object.assign(view, { git: {}, checked: {}, unsure: new Set(), worktrees: new Map(), watching: new Set(), openingWorktrees: new Set(), shown: new Set(['main', 'existing']), machines: [], reconnecting: {} });
    view.watch = () => {};
    const key = JSON.stringify([null, repo]);
    await view.check(key, {});
    assert.equal(view.git[key].linked, false);
    assert.equal(view.worktrees.get(view.git[key].repo).checkouts.length, 2);
    state.spaces = [{ id: 'main', folder: repo, machine: null, tabs: [] }];
    state.panes = [];
    state.commands = [];
    const row = { w: state.spaces[0], g: view.git[key] };
    view.ordered = () => [row];
    view.spaceTree = r => r;
    const rows = view.grouped({}, false);
    assert.equal(rows[0].discovered.length, 1);
    assert.deepEqual(state.commands, []);
    const checkout = rows[0].discovered[0];
    const timers = [];
    const cx = { notify() {}, timer: { after: (_ms, callback) => timers.push(callback) } };
    const node = view.worktreeRow(checkout, row, {});
    node.events.click({}, cx);
    node.events.click({}, cx);
    assert.equal(state.commands.length, 1, 'double-click must not create duplicate spaces');
    assert.deepEqual(state.commands[0], ['space.new', { folder: checkout.path, machine: '' }]);
    timers[0](cx);
    state.spaces.push({ id: 'existing', folder: join(linked, 'src'), machine: null, tabs: [] });
    node.events.click({}, cx);
    assert.deepEqual(state.commands[1], ['space.select', { id: 'existing' }]);
    assert.equal(view.grouped({}, false)[0].discovered.length, 0);
    // Another machine's identical folder is not an already-open local worktree.
    state.spaces[1].machine = 'remote';
    assert.equal(view.grouped({}, false)[0].discovered.length, 1);
    const linkedKey = JSON.stringify([null, linked]);
    await view.check(linkedKey, {});
    assert.equal(view.git[linkedKey].linked, true);
    assert.equal(view.git[linkedKey].repo, view.git[key].repo);
    await git(['worktree', 'remove', linked]);
    await view.check(key, {});
    assert.equal(view.grouped({}, false)[0].discovered.length, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});
