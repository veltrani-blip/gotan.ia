$ErrorActionPreference = "Stop"

Write-Host "Instalando dependencias do Gotan Voice Builder..." -ForegroundColor Cyan
npm install

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "Arquivo .env.local criado. Preencha ANTHROPIC_API_KEY e ANTHROPIC_MODEL." -ForegroundColor Yellow
}

Write-Host "Executando testes..." -ForegroundColor Cyan
npm test

Write-Host "Executando build..." -ForegroundColor Cyan
npm run build

Write-Host "Pronto. Rode: npm run dev" -ForegroundColor Green
