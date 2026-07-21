$ports = 5000,5001
foreach ($p in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    Write-Host "Stopping process on port $p (PID $($c.OwningProcess))"
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}
