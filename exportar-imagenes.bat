@echo off
echo ============================================
echo  Exportar Imagenes Docker - Proyecto Biblioteca
echo ============================================
echo.

REM Construir las imagenes
echo [1/4] Construyendo imagenes con docker-compose...
docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al construir las imagenes.
    pause
    exit /b 1
)
echo Imagenes construidas exitosamente.
echo.

REM Crear directorio para las imagenes exportadas
if not exist "docker-images" mkdir docker-images

REM Exportar imagen del frontend
echo [2/4] Exportando imagen del frontend...
docker save -o docker-images/biblioteca-frontend.tar biblioteca-frontend:latest
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al exportar imagen del frontend.
    pause
    exit /b 1
)
echo Frontend exportado: docker-images/biblioteca-frontend.tar
echo.

REM Exportar imagen del backend
echo [3/4] Exportando imagen del backend...
docker save -o docker-images/biblioteca-backend.tar biblioteca-backend:latest
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al exportar imagen del backend.
    pause
    exit /b 1
)
echo Backend exportado: docker-images/biblioteca-backend.tar
echo.

REM Exportar imagen de MySQL
echo [4/4] Exportando imagen de MySQL...
docker save -o docker-images/biblioteca-db.tar mysql:8.0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al exportar imagen de MySQL.
    pause
    exit /b 1
)
echo MySQL exportado: docker-images/biblioteca-db.tar
echo.

echo ============================================
echo  Exportacion completada exitosamente!
echo  Imagenes guardadas en: docker-images/
echo ============================================
echo.
echo Para importar en otro equipo:
echo   docker load -i docker-images/biblioteca-frontend.tar
echo   docker load -i docker-images/biblioteca-backend.tar
echo   docker load -i docker-images/biblioteca-db.tar
echo.
pause
