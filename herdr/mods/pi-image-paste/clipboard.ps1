param(
    [ValidateSet('Save', 'Restore')]
    [string]$Action = 'Save',
    [string]$ImagePath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
if ($Action -eq 'Save') {
    if (-not [Windows.Forms.Clipboard]::ContainsImage()) { exit 0 }
    $image = [Windows.Forms.Clipboard]::GetImage()
    if ($null -eq $image) { throw 'Clipboard image could not be read.' }
    try {
        $directory = Join-Path ([IO.Path]::GetTempPath()) 'herdr-pi-images'
        [IO.Directory]::CreateDirectory($directory) | Out-Null
        $path = Join-Path $directory (([Guid]::NewGuid().ToString('N')) + '.png')
        $image.Save($path, [Drawing.Imaging.ImageFormat]::Png)
        [Windows.Forms.Clipboard]::SetText('"' + $path.Replace('\', '/') + '" ')
        [Console]::Out.Write($path)
    } finally { $image.Dispose() }
} else {
    $expected = '"' + $ImagePath.Replace('\', '/') + '" '
    if ([Windows.Forms.Clipboard]::ContainsText() -and [Windows.Forms.Clipboard]::GetText() -eq $expected) {
        $image = [Drawing.Image]::FromFile($ImagePath)
        try { [Windows.Forms.Clipboard]::SetImage($image) }
        finally { $image.Dispose() }
    }
}
