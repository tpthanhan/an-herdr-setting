# Customization decisions

## Layout and agent tree

`herdr/layouts/herdr-skillshare.json` is the active personal layout exported here. It uses `space-agents-tree` for the Spaces block and hides the separate Agents block. Other layout elements, including the Skillshare panel, remain intact.

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
- `keys.json`: no keybindings were changed in this customization work; the live file also includes unrelated T3 bindings.
