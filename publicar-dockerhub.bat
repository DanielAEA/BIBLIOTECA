@echo off
setlocal
title Actualizar y Publicar en Docker Hub - CiberBook

echo ========================================================
echo   Actualizar y Publicar Imagenes en Docker Hub
echo   - daniel08escudero/ciberbook-backend:latest
echo   - daniel08escudero/ciberbook-frontend:latest
echo ========================================================
echo.

:: 1. Verificar Docker
echo [1/4] Verificando que Docker este activo...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta en ejecucion. Por favor inicia Docker Desktop.
    pause
    exit /b 1
)
echo Docker esta listo.
echo.

:: 2. Autenticacion en Docker Hub
echo [2/4] Verificando sesion en Docker Hub...
docker login -u daniel08escudero
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo autenticar en Docker Hub.
    pause
    exit /b 1
)
echo Autenticacion correcta.
echo.

:: 3. Reconstruir las imagenes con los cambios actuales
echo [3/4] Compilando y construyendo imagenes actualizadas...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al compilar las imagenes con docker compose.
    pause
    exit /b 1
)
echo Imagenes construidas exitosamente.
echo.

:: 4. Subir a Docker Hub
echo [4/4] Subiendo imagenes a Docker Hub...
echo.
echo -> Subiendo backend: daniel08escudero/ciberbook-backend:latest...
docker push daniel08escudero/ciberbook-backend:latest
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al subir la imagen del backend.
    pause
    exit /b 1
)

echo.
echo -> Subiendo frontend: daniel08escudero/ciberbook-frontend:latest...
docker push daniel08escudero/ciberbook-frontend:latest
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al subir la imagen del frontend.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   IMAGENES ACTUALIZADAS CON EXITO EN DOCKER HUB
echo ========================================================
echo  Backend:  https://hub.docker.com/r/daniel08escudero/ciberbook-backend
echo  Frontend: https://hub.docker.com/r/daniel08escudero/ciberbook-frontend
echo.
echo Para descargarlas o usarlas en otro equipo:
echo   docker pull daniel08escudero/ciberbook-backend:latest
echo   docker pull daniel08escudero/ciberbook-frontend:latest
echo ========================================================
pause
