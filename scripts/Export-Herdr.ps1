[CmdletBinding()]
param(
    [string]$HerdrHome = $(if ($env:HERDR_APP_HOME) { $env:HERDR_APP_HOME } else { Join-Path $HOME '.config/herdr-app' })
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $repo 'herdr'
# Explicit allowlist: never export terminal data, session identifiers or generated files.
$files = @('settings.json', 'layouts/herdr-skillshare.json', 'layouts/herdr-skillshare.png')
foreach ($mod in @('space-agents-tree', 'skillshare')) {
    $source = Join-Path $HerdrHome "mods/$mod"
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing mod: $source" }
    foreach ($file in Get-ChildItem -LiteralPath $source -Recurse -File) {
        if ($file.Extension -notin @('.js', '.json', '.svg', '.png')) { continue }
        if ($file.Name -eq 'jsconfig.json') { continue }
        $relative = $file.FullName.Substring($source.Length).TrimStart([char[]]'\/')
        $files += "mods/$mod/$relative"
    }
}
foreach ($relative in $files) {
    $source = Join-Path $HerdrHome $relative
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing file: $source" }
}
foreach ($relative in $files) {
    $target = Join-Path $destination $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    Copy-Item -LiteralPath (Join-Path $HerdrHome $relative) -Destination $target -Force
}
Write-Host "Exported $($files.Count) portable files to $destination"
Write-Host 'Review git diff and check for personal paths/secrets before publishing.'
