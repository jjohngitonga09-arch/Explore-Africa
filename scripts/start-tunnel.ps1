$exe = Join-Path $PSScriptRoot "..\tools\cloudflared.exe"
$exe = (Resolve-Path $exe).Path
& $exe tunnel --url http://localhost:5000
