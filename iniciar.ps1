#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $raiz

$venv = Join-Path $raiz '.venv'
$python = Join-Path $venv 'Scripts\python.exe'

if (-not (Test-Path $python)) {
    Write-Host 'Creando entorno virtual...' -ForegroundColor Cyan
    python -m venv $venv
}

Write-Host 'Instalando dependencias...' -ForegroundColor Cyan
& $python -m pip install -q -r (Join-Path $raiz 'requirements.txt')

Write-Host ''
Write-Host 'Servidor en http://0.0.0.0:5020' -ForegroundColor Green
Write-Host 'En esta PC: http://127.0.0.1:5020' -ForegroundColor Green
Write-Host 'En la red local: http://192.168.5.142:5020 (revisa LEEME.md si cambia la IP)' -ForegroundColor Green
Write-Host 'Detener con Ctrl+C' -ForegroundColor DarkGray
Write-Host ''

& $python -m waitress --listen=0.0.0.0:5020 app:app
