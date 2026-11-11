[CmdletBinding()]
param(
    [string]$HerdrHome = $(if ($env:HERDR_APP_HOME) { $env:HERDR_APP_HOME } else { Join-Path $HOME '.config/herdr-app' })
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $repo 'herdr'
# Explicit allowlist: never export terminal data, session identifiers or generated files.
$files = @('settings.json', 'layouts/herdr-skillshare.json')
foreach ($mod in @('space-agents-tree', 'pi-image-paste')) {
    $source = Join-Path $HerdrHome "mods/$mod"
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing mod: $source" }
    foreach ($file in Get-ChildItem -LiteralPath $source -Recurse -File) {
        if ($file.Extension -notin @('.js', '.json', '.svg', '.png', '.ps1')) { continue }
        if ($file.Name -eq 'jsconfig.json') { continue }
        $relative = $file.FullName.Substring($source.Length).TrimStart([char[]]'\/')
        $files += "mods/$mod/$relative"
    }
}
foreach ($relative in $files) {
    $source = Join-Path $HerdrHome $relative
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing file: $source" }
}
function Remove-SkillshareNodes($node) {
    if ($node.PSObject.Properties['children']) {
        $node.children = @($node.children | Where-Object { $_.id -notin @('skillshare-toggle', 'skillshare-panel') })
        foreach ($child in $node.children) { Remove-SkillshareNodes $child }
    }
}
foreach ($relative in $files) {
    $target = Join-Path $destination $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    if ($relative -eq 'layouts/herdr-skillshare.json') {
        $layout = Get-Content -LiteralPath (Join-Path $HerdrHome $relative) -Raw | ConvertFrom-Json
        Remove-SkillshareNodes $layout
        if ($layout.preview -eq 'layouts/herdr-skillshare.png') { $layout.PSObject.Properties.Remove('preview') }
        $json = $layout | ConvertTo-Json -Depth 50
        [IO.File]::WriteAllText($target, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
    } else {
        Copy-Item -LiteralPath (Join-Path $HerdrHome $relative) -Destination $target -Force
    }
}
Write-Host "Exported $($files.Count) portable files to $destination"
Write-Host 'Review git diff and check for personal paths/secrets before publishing.'
