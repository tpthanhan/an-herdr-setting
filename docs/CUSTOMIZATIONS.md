# Customization decisions

## Layout and agent tree

`herdr/layouts/herdr-skillshare.json` is the personal layout exported here. It uses `space-agents-tree` for the Spaces block and hides the separate Agents block. The Skillshare panel, toggle, mod and original preview are excluded. The layout name stays unchanged for compatibility with installed layouts and paste shortcuts. All other layout elements remain intact. Export strips those Skillshare elements from its copy without changing the live setup.

`space-agents-tree` was cloned through `herdr-app do mod.clone --name spaces --as space-agents-tree`. The clone metadata records Herdr 0.1.15. It retains the original space menus, worktree grouping, machine grouping and compact rail. Added behavior:

- Expanded spaces show their agents immediately below the space row.
- Agent status updates from Herdr's live data; working uses a native spinner.
- Click an agent to run `agent.focus` on its exact terminal address.
- Parent relationships from `terminals()` indent sub-agents beneath parents when both are in the same space.
- Fold choices persist under the shared key `space-agents-tree.folded`; IDs are local session data, not exported.
- Agent next/previous navigation is grouped by space.

The mod inherits the shipped Spaces mod's Git reads, repository watching and machine commands. It is not a passive theme. Personal clones do not receive future upstream changes automatically.

## Keep terminals on restart

Keep was explicitly ensured for the three terminals present during configuration. Those terminal addresses are deliberately not distributed: they are machine-specific. No invented `settings.json` restore flag is needed or included.

- App window restart: herdr-core keeps terminal processes alive.
- Computer/core restart: kept terminal structure recovers with shells at last folders; original commands are not rerun.
- Closing a pane or exiting/killing a terminal removes it.
- Herdr stores last selected space/tab/pane in its own `view.json`; do not commit or hand-edit it.

For an individually created core terminal, opt into recovery with `hc keep <address>`. Terminals created/adopted by Herdr already use keep.

## Browser design mode: discussed, not implemented

Herdr mods cannot embed a webview through the current public mod API. The proposed alternative was Chrome/Edge with an element picker, a local bridge and an optional Herdr context panel that explicitly sends selected DOM/style/screenshot context to an agent. Existing frontend-coach functionality may be reusable for MyBusiness apps. No browser extension, bridge, browser panel or native Herdr changes were implemented and none are included here.

## Deliberately excluded

- App-managed state: `shared.json`, `view.json`, `seen.json`, `installed.json`, window files and layout click-state.
- Terminal/core data, history, agent conversations and machine addresses.
- Herdr-generated API declarations and `jsconfig.json`.
- Shipped layouts/mods (except the explicitly modified Spaces clone).
- Unrelated pre-existing T3/Code layouts and mods.
- Full `keys.json`: unrelated personal bindings are not exported. `scripts/Install-PasteKeys.ps1` merges only Ctrl+V / Ctrl+Shift+V: native defaults move from `terminal` to `global`, allowing `layout:herdr-skillshare` to override them with `pi-image-paste.paste`. Other layouts keep native paste. Existing non-default bindings are refused, not overwritten.

## Windows clipboard images

`pi-image-paste` is a personal mod mounted as a zero-width layout block. It saves clipboard images as uniquely named PNGs under `%TEMP%/herdr-pi-images/`, pastes a quoted forward-slash path with a trailing space, and does not press Enter. Pi can read that path when requested. It uses external Windows PowerShell and reads/writes the system clipboard; the original image is restored after paste unless the clipboard changed meanwhile (other rich formats are not restored). Images remain in temp for later reads, with no network access or automatic cleanup. Non-image clipboard contents and remote terminals use native paste. Changing focus during the save cancels insertion rather than pasting into another terminal.

Validation: the mod passes `herdr-app check` and the running app reports no errors. An interactive clipboard-image paste into Pi still needs manual verification.
