# Run Pick-A-Pill on Android (Windows)
# Usage: .\scripts\dev-android.ps1

$ErrorActionPreference = 'Stop'

$JdkPath = Get-ChildItem 'C:\Program Files\Microsoft\jdk-17*' -Directory -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $JdkPath) {
  Write-Error 'JDK 17 not found. Run: winget install Microsoft.OpenJDK.17'
}

$SdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:JAVA_HOME = $JdkPath
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:Path = "$JdkPath\bin;$SdkRoot\platform-tools;$SdkRoot\emulator;$SdkRoot\cmdline-tools\latest\bin;$env:Path"

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

$devices = adb devices 2>&1 | Out-String
if ($devices -notmatch 'emulator-\d+\s+device' -and $devices -notmatch '\tdevice') {
  Write-Host 'No device/emulator detected. Starting PickAPill_API34...'
  Start-Process -FilePath "$SdkRoot\emulator\emulator.exe" -ArgumentList '-avd', 'PickAPill_API34' -WindowStyle Normal
  for ($i = 0; $i -lt 36; $i++) {
    Start-Sleep -Seconds 5
    $devices = adb devices 2>&1 | Out-String
    if ($devices -match 'emulator-\d+\s+device' -or $devices -match '\tdevice') { break }
  }
}

$metro = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
if (-not $metro) {
  Write-Host 'Starting Metro on port 8081 in a new window...'
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$projectRoot'; npx react-native start --port 8081"
  Start-Sleep -Seconds 8
}

adb reverse tcp:8081 tcp:8081 | Out-Null
Set-Location (Join-Path $projectRoot 'android')
& .\gradlew.bat app:installDebug
adb shell am start -n com.pickapill/.MainActivity
Write-Host 'App installed and launched. Metro should be running on http://localhost:8081'
