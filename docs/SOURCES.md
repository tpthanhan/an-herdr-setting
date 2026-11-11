# Sources and attribution

## Skillshare layout and mod

Source: https://github.com/runkids/skillshare/tree/main/herdr/skillshare

- `herdr/mods/skillshare/**`: upstream Skillshare mod by its original authors.
- `herdr/layouts/herdr-skillshare.png`: original upstream layout preview.
- `herdr/layouts/herdr-skillshare.json`: upstream layout, locally modified to use the Spaces/agents tree and hide the separate Agents section.
- Upstream recipe: https://github.com/runkids/skillshare/blob/main/herdr/skillshare/RECIPE.md

The upstream layout metadata records cloning Herdr's `main` layout at 0.1.12. This is a snapshot of the installed files, not a version-pinned dependency; the original installation used the upstream `main` branch. No remote commit hash was recorded at installation.

## Spaces/agents tree

`herdr/mods/space-agents-tree/main.js` is based on Herdr's shipped Spaces mod, cloned using Herdr's supported `mod.clone` command. Its metadata records source `spaces`, version 0.1.15. Local changes add nested agents, status indicators, expansion state and focus actions.

Herdr: https://herdr.dev/

## Licensing before public distribution

The exported files include third-party code and artwork. This repository does not apply a blanket license to them. Check the upstream Skillshare and Herdr licensing terms and preserve any required license/copyright notices before publishing publicly; attribution alone is not a license grant. A license for original local scripts/docs would not change the upstream code's terms.
