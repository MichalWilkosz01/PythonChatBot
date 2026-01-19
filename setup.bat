@echo off
setlocal

if not exist venv (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [INFO] Virtual environment already exists.
)

echo [INFO] Upgrading pip inside venv...
.\venv\Scripts\python.exe -m pip install --upgrade pip

if exist requirements.txt (
    echo [INFO] Installing dependencies from requirements.txt...
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
) else (
    echo [INFO] requirements.txt not found.
)

echo.
echo [INFO] Opening new CMD inside virtual environment...
start "" cmd.exe /k "call venv\Scripts\activate && echo [INFO] Virtual environment active!"

echo.
echo [SUCCESS] Setup complete.