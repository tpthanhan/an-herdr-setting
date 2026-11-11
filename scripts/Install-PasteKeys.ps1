[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$HerdrHome = $(if ($env:HERDR_APP_HOME) { $env:HERDR_APP_HOME } else { Join-Path $HOME '.config/herdr-app' })
)
$ErrorActionPreference = 'Stop'
$path = Join-Path $HerdrHome 'keys.json'
$keys = if (Test-Path -LiteralPath $path) { Get-Content -LiteralPath $path -Raw | ConvertFrom-Json } else { [pscustomobject]@{} }
foreach ($section in @('global', 'terminal', 'layout:herdr-skillshare')) {
    if (-not $keys.PSObject.Properties[$section]) { $keys | Add-Member -NotePropertyName $section -NotePropertyValue ([pscustomobject]@{}) }
}
$defaults = @{ 'ctrl-v' = 'terminal.paste_image'; 'ctrl-shift-v' = 'terminal.paste' }
foreach ($key in $defaults.Keys) {
    foreach ($section in @('terminal', 'global', 'layout:herdr-skillshare')) {
        $existing = $keys.$section.PSObject.Properties[$key]
        if ($existing -and $existing.Value -notin @($defaults[$key], 'pi-image-paste.paste')) {
            throw "Conflicting binding $section/$key. Review it before installing image paste."
        }
    }
}
if ($PSCmdlet.ShouldProcess($path, 'Back up and merge image paste shortcuts')) {
    if (Test-Path -LiteralPath $path) {
        $backup = Join-Path $HerdrHome ('backups/paste-keys-' + [DateTime]::Now.ToString('yyyyMMdd-HHmmss-fff'))
        New-Item -ItemType Directory -Force -Path $backup | Out-Null
        Copy-Item -LiteralPath $path -Destination (Join-Path $backup 'keys.json')
    }
    foreach ($key in $defaults.Keys) {
        $keys.terminal.PSObject.Properties.Remove($key)
        $keys.global | Add-Member -NotePropertyName $key -NotePropertyValue $defaults[$key] -Force
        $keys.'layout:herdr-skillshare' | Add-Member -NotePropertyName $key -NotePropertyValue 'pi-image-paste.paste' -Force
    }
    $json = $keys | ConvertTo-Json -Depth 30
    [IO.File]::WriteAllText($path, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
}
