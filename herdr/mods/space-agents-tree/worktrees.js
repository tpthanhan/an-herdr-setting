// Git's -z porcelain format preserves spaces, Unicode and literal newlines in paths.
export function parseWorktrees(output) {
  return output.split("\0\0").flatMap((block, index) => {
    const fields = block.split("\0");
    const path = fields.find(field => field.startsWith("worktree "))?.slice(9);
    if (!path || fields.includes("bare") || fields.some(field => field === "prunable" || field.startsWith("prunable "))) return [];
    const branch = fields.find(field => field.startsWith("branch "))?.slice(7).replace(/^refs\/heads\//, "") ?? null;
    const head = fields.find(field => field.startsWith("HEAD "))?.slice(5) ?? "";
    return [{ path, branch, head, main: index === 0, locked: fields.some(field => field === "locked" || field.startsWith("locked ")) }];
  });
}

export function pathKey(path) {
  let normalized = (path ?? "").replace(/\\/g, "/").replace(/\/+$/, "");
  // Windows paths are case-insensitive; remote Unix paths are not.
  if (/^[A-Za-z]:\//.test(normalized) || normalized.startsWith("//")) normalized = normalized.toLowerCase();
  return normalized;
}

export function checkoutForFolder(checkouts, folder) {
  const at = pathKey(folder);
  return checkouts.filter(checkout => {
    const root = pathKey(checkout.path);
    return at === root || at.startsWith(root + "/");
  }).sort((a, b) => b.path.length - a.path.length)[0] ?? null;
}

export function unopenedWorktrees(checkouts, folders, currentTop) {
  const opened = new Set(folders.map(folder => checkoutForFolder(checkouts, folder)).filter(Boolean).map(checkout => pathKey(checkout.path)));
  // The main checkout isn't an extra worktree. If only a linked checkout is open,
  // still discover its sibling worktrees without proposing the main one as a child.
  return checkouts.filter(checkout => !checkout.main && pathKey(checkout.path) !== pathKey(currentTop) && !opened.has(pathKey(checkout.path)));
}
