@echo off
setlocal
title Microservicio Predictivo - CiberBook ML
cd /d "%~dp0microservicio-predictivo"

echo ========================================================
echo   Iniciando Microservicio Predictivo (FastAPI + ML)
echo   Puerto: http://localhost:8000
echo   Documentacion Swagger: http://localhost:8000/docs
echo ========================================================
echo.

:: Verificar si existe entorno virtual local
if exist "venv\Scripts\activate.bat" (
    echo Activando entorno virtual local...
    call venv\Scripts\activate.bat
)

:: Intentar levantar con uvicorn
python -m uvicorn api_predictiva:app --host 0.0.0.0 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Si no tienes Python configurado localmente, puedes levantarlo con Docker:
    echo   docker run -d -p 8000:8000 --name ciberbook-predictivo daniel08escudero/ciberbook-predictivo:latest
    echo   o con todo el stack en: actualizar-docker-local.bat
    echo.
    pause
)

