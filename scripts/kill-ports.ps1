# Frees ports before starting dev (Windows)
$ports = 3000, 5000
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "Ports 3000 and 5000 cleared."
