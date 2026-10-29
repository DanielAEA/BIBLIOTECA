@echo off
setlocal
title Actualizar y Levantar Proyecto Biblioteca en Docker

echo ========================================================
echo   Actualizar Imagenes y Levantar Proyecto en Docker
echo ========================================================
echo.

:: 1. Verificar Docker
echo [1/4] Verificando Docker...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta corriendo. Por favor abre Docker Desktop e intenta nuevamente.
    pause
    exit /b 1
)
echo Docker esta listo.
echo.

:: 2. Detener contenedores anteriores si existen
echo [2/4] Deteniendo contenedores anteriores...
docker compose down

:: 3. Reconstruir imagenes con los ultimos cambios de codigo
echo.
echo [3/4] Reconstruyendo imagenes con los cambios actuales...
docker compose build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ocurrio un error al compilar las imagenes.
    pause
    exit /b 1
)
echo Imagenes actualizadas exitosamente.
echo.

:: 4. Levantar los servicios
echo [4/4] Levantando contenedores en segundo plano...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al iniciar los contenedores.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   PROYECTO ACTUALIZADO Y CORRIENDO EN DOCKER
echo ========================================================
echo.
docker compose ps
echo.
echo Accesos locales:
echo  - Frontend: http://localhost:80
echo  - Backend:  http://localhost:8080
echo.
echo Comandos utiles:
echo  - Ver logs en vivo:     docker compose logs -f
echo  - Detener el proyecto:  docker compose down
echo ========================================================
echo.
set /p "VER_LOGS=Deseas ver los logs en tiempo real ahora? (S/N): "
if /i "%VER_LOGS%"=="S" (
    docker compose logs -f
)
pause
