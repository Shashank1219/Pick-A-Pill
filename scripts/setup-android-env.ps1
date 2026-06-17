# Pick-A-Pill Android dev environment bootstrap (Windows)
# Run from PowerShell: .\scripts\setup-android-env.ps1

$ErrorActionPreference = 'Stop'

$JdkPath = Get-ChildItem 'C:\Program Files\Microsoft' -Filter 'jdk-17*' -Directory -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $JdkPath) {
  Write-Error 'JDK 17 not found. Install with: winget install Microsoft.OpenJDK.17'
}

$SdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'

[Environment]::SetEnvironmentVariable('JAVA_HOME', $JdkPath, 'User')
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $SdkRoot, 'User')
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $SdkRoot, 'User')

$pathAdditions = @(
  (Join-Path $JdkPath 'bin'),
  (Join-Path $SdkRoot 'platform-tools'),
  (Join-Path $SdkRoot 'emulator'),
  (Join-Path $SdkRoot 'cmdline-tools\latest\bin')
)

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
foreach ($entry in $pathAdditions) {
  if ($userPath -notlike "*$entry*") {
    $userPath = "$userPath;$entry"
  }
}
[Environment]::SetEnvironmentVariable('Path', $userPath, 'User')

$env:JAVA_HOME = $JdkPath
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:Path = "$JdkPath\bin;$SdkRoot\platform-tools;$SdkRoot\emulator;$SdkRoot\cmdline-tools\latest\bin;$env:Path"

$localProps = Join-Path $PSScriptRoot '..\android\local.properties'
"sdk.dir=$($SdkRoot -replace '\\','\\')" | Set-Content -Path $localProps -Encoding ASCII

Write-Host "JAVA_HOME=$JdkPath"
Write-Host "ANDROID_HOME=$SdkRoot"
Write-Host "Wrote $localProps"

if (-not (Test-Path (Join-Path $SdkRoot 'platform-tools\adb.exe'))) {
  Write-Host ''
  Write-Host 'Android SDK is not fully installed yet.'
  Write-Host '1. Open Android Studio (Start menu -> Android Studio)'
  Write-Host '2. Complete the setup wizard (Standard install)'
  Write-Host '3. Tools -> Device Manager -> Create Device (Pixel, API 34+)'
  Write-Host '4. Close and reopen this terminal, then run: npm run android'
  exit 1
}

Write-Host ''
Write-Host 'Environment ready. Open a NEW terminal and run: npm run android'
