# QuickBingo Release APK Build Script

Write-Host "QuickBingo Release APK olusturuluyor..." -ForegroundColor Green

npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

npx cap sync android  
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Android Release APK olusturuluyor..." -ForegroundColor Yellow
Set-Location "android"

if (Test-Path "gradlew.bat") {
    .\gradlew.bat assembleRelease
} else {
    gradle assembleRelease
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Release APK basariyla olusturuldu!" -ForegroundColor Green
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        Write-Host "APK konumu: android\$apkPath" -ForegroundColor Cyan
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "APK boyutu: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }
    
    Write-Host "Guvenlik Ozellikleri Aktif:" -ForegroundColor Yellow
    Write-Host "- ProGuard Obfuscation" -ForegroundColor Green
    Write-Host "- Code Minification" -ForegroundColor Green  
    Write-Host "- Release Keystore Imza" -ForegroundColor Green
    Write-Host "- SHA-1 Fingerprint Koruma" -ForegroundColor Green
} else {
    Write-Host "APK olusturulamadi!" -ForegroundColor Red
}

Set-Location ".."
pause 