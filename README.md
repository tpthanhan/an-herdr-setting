# Personal settings — Herdr

Portable Herdr customizations, exported from the working setup. This repository does not contain terminal sessions, terminal history, credentials, or machine-specific workspace state.

## Included

- **Personal Herdr layout:** the standard sidebar/work area without the Skillshare panel or toggle.
- **Spaces/agents tree:** agents nested beneath their spaces, with live status indicators and click-to-focus. Space chevrons expand/collapse agent lists; sub-agents nest under their parent when available. The separate Agents section is hidden in this layout. Narrow sidebar mode keeps the original space rail.
- **Windows image paste:** Ctrl+V / Ctrl+Shift+V in the personal layout save clipboard images to temporary PNGs and paste quoted paths without submitting. Ordinary text/file paste stays native; other layouts retain native paste shortcuts.
- **Personal look/preferences:** dark appearance, zoom 1, sounds disabled, minimum contrast 1. Applying these preferences is optional.

```text
herdr/
  settings.json
  layouts/
    herdr-skillshare.json
  mods/
    space-agents-tree/
    pi-image-paste/
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

`-Overwrite` copies existing affected items into a timestamped `backups/setting-*` folder inside the Herdr home before replacing files. Unrelated layouts, mods and keybindings are untouched. The installer merges the image-paste shortcuts using `scripts/Install-PasteKeys.ps1`, backs up `keys.json`, and refuses conflicting custom paste bindings. Use `-WhatIf` to preview file changes (mod validation still runs). `-HerdrHome <path>` selects the file destination; to activate a non-default running window, set `HERDR_APP_HOME` to that same path first. The scripts otherwise honor `HERDR_APP_HOME`, falling back to `~/.config/herdr-app`.

To return to another layout, use **Ctrl+Shift+L**. Herdr's emergency reset is **Ctrl+Alt+Shift+Escape**.

## Image paste prerequisites and permissions

Windows only: uses Windows PowerShell (`powershell.exe -STA`), Windows Forms clipboard access and System.Drawing. It reads clipboard images, writes unique PNGs under `%TEMP%/herdr-pi-images/`, temporarily puts the quoted path on the clipboard for Herdr's native paste, then restores the image if the clipboard still contains that path. Rich clipboard formats are not preserved. Files remain available for Pi's read tool until you or Windows clean up the temp folder; images are not uploaded or automatically submitted. Switching terminal focus while saving cancels the paste. Remote terminals retain native Herdr paste behavior.

The mod is a zero-width service block in `herdr-skillshare`; other layouts do not depend on it. Plain text and copied files fall back to native paste. No Pi extension or shared library changes are needed.

## Refresh this export

After changing the live layout/mods/preferences:

```powershell
.\scripts\Export-Herdr.ps1
git diff
```

The existing `herdr-skillshare` layout name is retained only for compatibility with installed layouts and paste shortcuts; Skillshare is not included. The exporter removes the Skillshare toggle, panel and original preview reference from the exported layout even if they remain in the live setup. Export does not modify that live setup.

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
herdr-app check ./herdr/mods/pi-image-paste
```

Both retained mods passed checks on the source machine. Export from a fixture containing the live layout and installation into an isolated temporary Herdr home were verified: Skillshare stays excluded, retained settings/mod files remain unchanged, and paste shortcuts are installed. The live setup was not modified. The agent tree was previously confirmed rendered in the running app with no reported errors. Full installation on a second machine and reboot restoration have not been tested.
