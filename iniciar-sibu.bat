@echo off
echo ========================================
echo       SIBU - Inicio Simplificado
echo ========================================

:: Obtener la ruta del directorio actual
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo 1. Iniciando ngrok...
if exist "ngrok.exe" (
    start "ngrok" cmd /c "ngrok.exe http 8080"
) else (
    echo [ERROR] ngrok.exe no encontrado en %PROJECT_ROOT%
)

echo Esperando 5 segundos para conexion...
timeout /t 5 /nobreak >nul

echo 2. Iniciando Spring Boot...
start "springboot" cmd /k "cd /d "%PROJECT_ROOT%Backend\biblioteca" && .\mvnw.cmd spring-boot:run"

echo 3. Iniciando Angular...
start "angular" cmd /k "cd /d "%PROJECT_ROOT%sistema-prestamos-frontend\frontend" && npm start"

echo.
echo ========================================
echo SERVICIOS INICIADOS
echo ========================================
pause
