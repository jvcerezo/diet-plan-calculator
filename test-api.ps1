# Demo API Test Script
# Test the Diet Plan Calculator API endpoints

# Test basic calculation
$testData = @{
    weight = 70
    height = 175
    age = 25
    gender = "male"
    activityLevel = "moderatelyActive"
    goal = "maintain"
    carbPercent = 50
    proteinPercent = 20
    fatPercent = 30
} | ConvertTo-Json

Write-Host "Testing Diet Plan Calculator API..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test health endpoint
Write-Host ""
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "✓ Health check passed: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test calculation endpoint
Write-Host ""
Write-Host "2. Testing calculation endpoint..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/calculate" -Method Post -Body $testData -ContentType "application/json"
    Write-Host "✓ Calculation successful!" -ForegroundColor Green
    Write-Host "  BMI: $($result.metrics.bmi)" -ForegroundColor Cyan
    Write-Host "  BMR: $($result.metrics.bmr) calories/day" -ForegroundColor Cyan
    Write-Host "  TDEE: $($result.metrics.tdee) calories/day" -ForegroundColor Cyan
    Write-Host "  Target: $($result.metrics.targetCalories) calories/day" -ForegroundColor Cyan
    Write-Host "  BMI Classification: $($result.metrics.bmiClassification.category)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Calculation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test foods endpoint
Write-Host ""
Write-Host "3. Testing foods endpoint..." -ForegroundColor Yellow
try {
    $foods = Invoke-RestMethod -Uri "http://localhost:5000/api/foods" -Method Get
    Write-Host "✓ Foods retrieved successfully! Found $($foods.Count) food items:" -ForegroundColor Green
    $foods | ForEach-Object { 
        Write-Host "  - $($_.name) ($($_.category)): $($_.calories) cal/$($_.servingSize)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Foods retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "API Testing Complete!" -ForegroundColor Green
