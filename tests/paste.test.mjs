import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../herdr/mods/pi-image-paste/main.js', import.meta.url), 'utf8');
const stopped = new Error('test command stream ended');
const state = {};
globalThis.__herdrPasteTest = {
  View: class {}, div() {}, appHome: () => '', exec() { throw new Error('Unexpected PowerShell launch'); },
  focused: () => ({ terminal: state.focus }),
  nextCommand: async () => { if (state.remaining-- > 0) return 'paste'; throw stopped; },
  notify: message => state.notices.push(message),
  run: command => state.commands.push(command),
};
const code = source.replace(/import \{([^}]+)\} from "(?:gpui-kit|herdr)";/g,
  (_, names) => `const {${names}} = globalThis.__herdrPasteTest;`);
const { default: Paste } = await import(`data:text/javascript;base64,${Buffer.from(code + '\n//# sourceURL=pi-image-paste-main.js').toString('base64')}`);

async function paste({ text, terminal = 't1', image = '', count = 1, changeFocus = false }) {
  Object.assign(state, { focus: terminal, remaining: count, commands: [], notices: [] });
  const calls = [];
  let reads = 0;
  let task;
  const view = new Paste();
  view.clipboard = async (action, path) => {
    calls.push([action, path]);
    if (changeFocus && action === 'Save') state.focus = 't2';
    return { code: 0, stdout: action === 'Save' ? image : '' };
  };
  view.init({}, {
    spawn: callback => { task = callback({ read_from_clipboard: () => { reads++; return text; } }); },
  });
  await assert.rejects(task, error => error === stopped);
  return { calls, reads, commands: state.commands, notices: state.notices };
}

test('plain, large and empty text paste natively without launching image helpers', async () => {
  for (const text of ['hello', 'a\n'.repeat(100000), '']) {
    const result = await paste({ text });
    assert.deepEqual(result.calls, []);
    assert.deepEqual(result.commands, ['terminal.paste']);
    assert.equal(result.reads, 1);
  }
});

test('repeated text pastes do not queue PowerShell checks', async () => {
  const result = await paste({ text: 'repeat', count: 10 });
  assert.equal(result.commands.length, 10);
  assert.deepEqual(result.calls, []);
});

test('remote terminal paste stays native without inspecting the local clipboard', async () => {
  const result = await paste({ terminal: 'remote/t1' });
  assert.equal(result.reads, 0);
  assert.deepEqual(result.calls, []);
  assert.deepEqual(result.commands, ['terminal.paste']);
});

test('image-only clipboard still saves, pastes and restores the image', async () => {
  const path = 'C:/Temp/image.png';
  const result = await paste({ image: path });
  assert.deepEqual(result.calls, [['Save', undefined], ['Restore', path]]);
  assert.deepEqual(result.commands, ['terminal.paste_image']);
});

test('non-text/non-image data still falls back to native paste', async () => {
  const result = await paste({});
  assert.deepEqual(result.calls, [['Save', undefined]]);
  assert.deepEqual(result.commands, ['terminal.paste']);
});

test('focus changes still cancel image paste and restore the clipboard', async () => {
  const path = 'C:/Temp/image.png';
  const result = await paste({ image: path, changeFocus: true });
  assert.deepEqual(result.commands, []);
  assert.deepEqual(result.calls, [['Save', undefined], ['Restore', path]]);
  assert.equal(result.notices.length, 1);
});
