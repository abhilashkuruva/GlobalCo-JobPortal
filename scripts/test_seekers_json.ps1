$login = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"Password@123"}'
$t = $login.token
$res = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/job-seekers' -Method Get -Headers @{ Authorization = "Bearer $t" }
Write-Host "Returned seekers count: $($res.Count)"
$res[0] | ConvertTo-Json -Depth 5
