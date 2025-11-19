# Project Setup Verification Script

Write-Host "=== Solana Polling dApp - Setup Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Anchor Project
Write-Host "Checking Anchor Project..." -ForegroundColor Yellow
$anchorFiles = @(
    "anchor_project\Anchor.toml",
    "anchor_project\Cargo.toml",
    "anchor_project\package.json",
    "anchor_project\programs\polling_dapp\src\lib.rs",
    "anchor_project\tests\polling_dapp.ts"
)

$anchorOk = $true
foreach ($file in $anchorFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING" -ForegroundColor Red
        $anchorOk = $false
    }
}

Write-Host ""

# Check Frontend
Write-Host "Checking Frontend..." -ForegroundColor Yellow
$frontendFiles = @(
    "frontend\package.json",
    "frontend\public\index.html",
    "frontend\src\App.tsx",
    "frontend\src\index.tsx",
    "frontend\src\idl.ts",
    "frontend\src\components\PollingApp.tsx"
)

$frontendOk = $true
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING" -ForegroundColor Red
        $frontendOk = $false
    }
}

Write-Host ""

# Check Documentation
Write-Host "Checking Documentation..." -ForegroundColor Yellow
$docFiles = @(
    "README.md",
    "PROJECT_DESCRIPTION.md",
    "DEPLOYMENT_GUIDE.md"
)

$docOk = $true
foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING" -ForegroundColor Red
        $docOk = $false
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan

if ($anchorOk -and $frontendOk -and $docOk) {
    Write-Host "✓ All files are in place! Ready to build and deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. cd anchor_project && yarn install && anchor build" -ForegroundColor White
    Write-Host "2. cd ../frontend && npm install" -ForegroundColor White
    Write-Host "3. Review DEPLOYMENT_GUIDE.md for deployment instructions" -ForegroundColor White
} else {
    Write-Host "✗ Some files are missing. Please check the output above." -ForegroundColor Red
}

Write-Host ""
