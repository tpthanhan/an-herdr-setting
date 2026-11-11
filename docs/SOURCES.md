# Sources and attribution

## Layout origin

`herdr/layouts/herdr-skillshare.json` originated from https://github.com/runkids/skillshare/tree/main/herdr/skillshare, whose layout metadata records cloning Herdr's `main` layout at 0.1.12. Local changes add the Spaces/agents tree and image-paste service, hide the separate Agents section, and remove the Skillshare toggle and panel. The original layout name remains for compatibility only; the Skillshare mod and preview artwork are no longer distributed here.

This is a snapshot, not a version-pinned dependency; the original installation used the upstream `main` branch. No remote commit hash was recorded at installation.

## Spaces/agents tree

`herdr/mods/space-agents-tree/main.js` is based on Herdr's shipped Spaces mod, cloned using Herdr's supported `mod.clone` command. Its metadata records source `spaces`, version 0.1.15. Local changes add nested agents, status indicators, expansion state and focus actions.

Herdr: https://herdr.dev/

## Licensing before public distribution

The exported files include third-party-derived code. This repository does not apply a blanket license to them. Check the upstream layout and Herdr licensing terms and preserve any required license/copyright notices before publishing publicly; attribution alone is not a license grant. A license for original local scripts/docs would not change the upstream code's terms.
