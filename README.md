# Personal settings — Herdr

Portable Herdr customizations, exported from the working setup. This repository does not contain terminal sessions, terminal history, credentials, or machine-specific workspace state.

## Included

- **Herdr + Skillshare layout:** the standard sidebar/work area with a Skillshare toggle and panel.
- **Spaces/agents tree:** agents nested beneath their spaces, with live status indicators and click-to-focus. Space chevrons expand/collapse agent lists; sub-agents nest under their parent when available. The separate Agents section is hidden in this layout. Narrow sidebar mode keeps the original space rail.
- **Personal look/preferences:** dark appearance, zoom 1, sounds disabled, minimum contrast 1. Applying these preferences is optional.
- **Upstream layout preview:** the original Skillshare image; it does not depict the added agent tree.

```text
herdr/
  settings.json
  layouts/
    herdr-skillshare.json
    herdr-skillshare.png
  mods/
    space-agents-tree/
    skillshare/
scripts/
  Export-Herdr.ps1
  Install-Herdr.ps1
docs/
  CUSTOMIZATIONS.md
  SOURCES.md
```

## Install on another machine

Install and launch Herdr first so its built-in mods and current type files exist. The layout references built-in `workspace-chrome`, `tabs`, `pane`, `files`, `changes` and `workspace-status`; those are intentionally not vendored.

From PowerShell in this repository:

```powershell
# Install custom layout/mods only; leave existing personal settings unchanged.
.\scripts\Install-Herdr.ps1 -Activate

# Also apply the exported look/preferences.
.\scripts\Install-Herdr.ps1 -ApplySettings -Activate

# Existing files/mod names are refused by default. After reviewing collisions:
.\scripts\Install-Herdr.ps1 -Overwrite -ApplySettings -Activate
```

`-Overwrite` copies existing affected items into a timestamped `backups/setting-*` folder inside the Herdr home before replacing files. Other layouts, mods and keybindings are untouched. Use `-WhatIf` to preview file changes (mod validation still runs). `-HerdrHome <path>` selects the file destination; to activate a non-default running window, set `HERDR_APP_HOME` to that same path first. The scripts otherwise honor `HERDR_APP_HOME`, falling back to `~/.config/herdr-app`.

To return to another layout, use **Ctrl+Shift+L**. Herdr's emergency reset is **Ctrl+Alt+Shift+Escape**.

## Skillshare prerequisites and permissions

The Skillshare mod runs external programs, including `skillshare`, `git`, `sh` and POSIX shell helpers. It can clone user-supplied install URLs, update/sync resources and read its temporary job files. Audit hand-off uses `hc send`. Review its code before installing.

**Known Windows limitation:** the current setup previously reported `cannot run sh: program not found`, and `skillshare` was not on the shell PATH at that time. A passing Herdr mod check verifies initial rendering, not those external dependencies. Install/configure compatible tools for Herdr's process environment before relying on the panel. This repo does not install them or rewrite PATH.

## Refresh this export

After changing the live layout/mods/preferences:

```powershell
.\scripts\Export-Herdr.ps1
git diff
```

The exporter uses an allowlist and omits generated declarations, session state and unrelated layouts/mods. It copies current files, but does not delete obsolete files in the repository; review deletions manually. Always inspect the diff for personal paths or secrets before publishing. Avoid committing screenshots of your live terminal.

## Terminal restoration

Herdr already keeps terminals it creates. Closing/reopening the app reconnects to running core terminals. After a Windows reboot or core loss, kept terminals recover as shells in their last folders—not as resumed agents/commands. Last-selected space/tab/pane is app-managed state and deliberately not exported. See [customization notes](docs/CUSTOMIZATIONS.md).

## Publish to GitHub

This folder is a local Git repository; no remote or commit is created automatically.

```powershell
git add .
git diff --cached
# Review upstream attribution/licensing in docs/SOURCES.md before public sharing.
git commit -m "Add portable Herdr customizations"
# Create an empty repository on GitHub, then:
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

## Validation

```powershell
herdr-app check ./herdr/mods/space-agents-tree
herdr-app check ./herdr/mods/skillshare
```

Both mods passed checks on the source machine. The agent tree was also confirmed rendered in the running app with no reported errors. Full installation on a second machine and reboot restoration have not been tested.
