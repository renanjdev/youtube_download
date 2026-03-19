@echo off
echo =========================================
echo       Iniciando o Media SaaS
echo =========================================
echo.

:: Inicia o Backend em uma nova janela
echo [1/3] Iniciando o Servidor Backend (FastAPI)...
start "Backend" cmd /k "cd /d "%~dp0backend" && .\.venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Aguarda 3 segundos
timeout /t 3 /nobreak >nul

:: Inicia o Frontend na janela atual
echo [2/3] Preparando o Frontend (Next.js)...
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Instalando dependencias do frontend...
  call npm install
)

set "NEXT_PUBLIC_ENABLE_MOCK=false"
set "NEXT_PUBLIC_API_URL=http://localhost:8000"

:: Abre o navegador após 4 segundos
echo [3/3] Abrindo o seu navegador...
start "" cmd /c "timeout /t 4 >nul && start http://localhost:3000"

:: Roda o servidor do Frontend na janela principal
call npm run dev
