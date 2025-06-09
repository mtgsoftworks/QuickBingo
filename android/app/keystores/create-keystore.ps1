# QuickBingo Release Keystore Oluşturma Script'i
# PowerShell versiyonu

Write-Host "🔐 QuickBingo Release Keystore oluşturuluyor..." -ForegroundColor Green

# Keystore parametreleri
$keystoreFile = "quickbingo-release.keystore"
$alias = "quickbingo-release-key"
$storePass = "quickbingo2025"
$keyPass = "quickbingo2025"
$dname = "CN=QuickBingo,OU=MTG SoftWorks,O=MTG SoftWorks,L=Istanbul,S=Istanbul,C=TR"

# Keystore oluştur
Write-Host "⚙️  Keystore oluşturuluyor..."
& keytool -genkey -v -keystore $keystoreFile -alias $alias -keyalg RSA -keysize 2048 -validity 10000 -dname $dname -storepass $storePass -keypass $keyPass

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Keystore başarıyla oluşturuldu!" -ForegroundColor Green
    
    # SHA-1 fingerprint al
    Write-Host "🔍 SHA-1 Fingerprint alınıyor..."
    & keytool -list -v -keystore $keystoreFile -alias $alias -storepass $storePass
    
    Write-Host ""
    Write-Host "🚀 ÖNEMLİ TALİMATLAR:" -ForegroundColor Yellow
    Write-Host "1. Yukarıdaki SHA-1 fingerprint'i kopyalayın" -ForegroundColor Cyan
    Write-Host "2. Firebase Console > Project Settings > Your apps > Android app'e gidin" -ForegroundColor Cyan
    Write-Host "3. SHA certificate fingerprints bölümüne SHA-1'i ekleyin" -ForegroundColor Cyan
    Write-Host "4. google-services.json dosyasını indirip android/app/ klasörüne koyun" -ForegroundColor Cyan
    Write-Host "5. Firebase > Authentication > Sign-in method'da Google'ı aktif edin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📱 APK Build için:" -ForegroundColor Magenta
    Write-Host "   npx cap build android --release" -ForegroundColor White
    
} else {
    Write-Host "❌ Keystore oluşturulamadı! Java JDK kurulu mu?" -ForegroundColor Red
    Write-Host "Java JDK indirin: https://adoptopenjdk.net/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔒 Güvenlik bilgileri:" -ForegroundColor Yellow
Write-Host "   Keystore dosyasını güvenli bir yerde saklayın!" -ForegroundColor Red
Write-Host "   Store Password: $storePass" -ForegroundColor White
Write-Host "   Key Password: $keyPass" -ForegroundColor White
Write-Host "   Alias: $alias" -ForegroundColor White

pause 