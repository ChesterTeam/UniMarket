@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM ===== Campus Marketplace: автозапуск FastAPI (Uvicorn) =====

REM Определяем корень (где лежит этот скрипт)
set "ROOT=%~dp0"
cd /d "%ROOT%"

REM 1) Создать venv если нет
if not exist ".venv" (
    echo [*] Creating virtual environment .venv
    python -m venv .venv
    if errorlevel 1 (
        echo [!] Error creating venv. Ensure Python 3.10+ is installed and on PATH.
        pause
        exit /b 1
    )
)

REM 2) Активировать venv
call .venv\Scripts\activate
if errorlevel 1 (
    echo [!] Cannot activate venv
    pause
    exit /b 1
)

REM 3) Установить зависимости (только если есть requirements.txt)
if exist requirements.txt (
    echo [*] Installing requirements...
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [!] pip install failed
        pause
        exit /b 1
    )
)

REM 4) Запуск Uvicorn (FastAPI) в новом окне
echo [*] Starting Uvicorn on http://127.0.0.1:8000
start "Campus Marketplace Server" cmd /k ".venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM 5) Ждём пару секунд и открываем браузер
timeout /t 2 >nul
start http://127.0.0.1:8000

echo [*] Done. Server is running in a separate window.
pause >nul
