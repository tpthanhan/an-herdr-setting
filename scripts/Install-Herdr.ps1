[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$HerdrHome = $(if ($env:HERDR_APP_HOME) { $env:HERDR_APP_HOME } else { Join-Path $HOME '.config/herdr-app' }),
    [switch]$Overwrite,
    [switch]$ApplySettings,
    [switch]$Activate
)
$ErrorActionPreference = 'Stop'
$source = Join-Path (Split-Path $PSScriptRoot -Parent) 'herdr'
$items = @('mods/space-agents-tree', 'mods/skillshare', 'layouts/herdr-skillshare.json', 'layouts/herdr-skillshare.png')
if ($ApplySettings) { $items += 'settings.json' }
$app = Get-Command herdr-app -ErrorAction Stop
# Validate before touching the destination. Check does not run later async UI states.
foreach ($mod in @('space-agents-tree', 'skillshare')) {
    # Herdr is a Windows GUI executable; PowerShell needs an explicit wait for its exit code.
    $checked = Start-Process -FilePath $app.Source -ArgumentList @('check', ('"{0}"' -f (Join-Path $source "mods/$mod"))) -NoNewWindow -Wait -PassThru
    if ($checked.ExitCode -ne 0) { throw "Mod validation failed: $mod" }
}
$collisions = @($items | Where-Object { Test-Path -LiteralPath (Join-Path $HerdrHome $_) })
if ($collisions.Count -and -not $Overwrite) {
    throw "Already exists: $($collisions -join ', '). Review first; use -Overwrite to back up and replace these items."
}
$backup = Join-Path $HerdrHome ('backups/setting-' + [DateTime]::Now.ToString('yyyyMMdd-HHmmss-fff'))
foreach ($item in $items) {
    $target = Join-Path $HerdrHome $item
    if (-not $PSCmdlet.ShouldProcess($target, 'Install customization (back up existing item)')) { continue }
    if (Test-Path -LiteralPath $target) {
        $saved = Join-Path $backup $item
        New-Item -ItemType Directory -Force -Path (Split-Path $saved -Parent) | Out-Null
        Copy-Item -LiteralPath $target -Destination $saved -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    # Copy files into an existing mod folder rather than nesting the folder inside itself.
    $from = Join-Path $source $item
    if (Test-Path -LiteralPath $from -PathType Container) {
        New-Item -ItemType Directory -Force -Path $target | Out-Null
        Get-ChildItem -LiteralPath $from -File -Recurse | ForEach-Object {
            $relative = $_.FullName.Substring($from.Length).TrimStart([char[]]'\/')
            $fileTarget = Join-Path $target $relative
            New-Item -ItemType Directory -Force -Path (Split-Path $fileTarget -Parent) | Out-Null
            Copy-Item -LiteralPath $_.FullName -Destination $fileTarget -Force
        }
    } else { Copy-Item -LiteralPath $from -Destination $target -Force }
}
if ($Activate -and $PSCmdlet.ShouldProcess('Herdr', 'Switch to herdr-skillshare layout')) {
    $switched = Start-Process -FilePath $app.Source -ArgumentList @('do', 'layout.switch', '--name', 'herdr-skillshare') -NoNewWindow -Wait -PassThru
    if ($switched.ExitCode -ne 0) { throw 'Layout activation failed. Start Herdr and switch to herdr-skillshare.' }
}
if ($collisions.Count) { Write-Host "Existing items backed up to $backup (unless -WhatIf)." }
Write-Host 'Keys and machine/session state were not changed.'
