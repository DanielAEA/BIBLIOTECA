@echo off
setlocal
title Cargar Datasets de Usuarios y 1000 Prestamos - CiberBook
cd /d "%~dp0"

REM Detectar y agregar mongoimport si no esta en PATH
where mongoimport >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\MongoDB\Tools\100\bin\mongoimport.exe" (
        set "PATH=%PATH%;C:\Program Files\MongoDB\Tools\100\bin"
    )
)

echo ========================================================
echo   Cargar Datasets en MongoDB (Usuarios y 1000 Prestamos)
echo ========================================================
echo.
echo Selecciona el destino de importacion:
echo   [1] MongoDB Local (mongodb://localhost:27017/biblioteca)
echo   [2] MongoDB en Docker (contenedor 'mongodb')
echo   [3] MongoDB Railway / Remoto (ingresar URI)
echo.
set /p "OPCION=Elige una opcion (1/2/3, por defecto 1): "

if "%OPCION%"=="2" (
    echo.
    set "DOCKER_CONTAINER=mongodb"
    docker ps -a --format "{{.Names}}" | findstr /i "^biblioteca-db$" >nul 2>&1
    if %ERRORLEVEL%==0 set "DOCKER_CONTAINER=biblioteca-db"
    
    echo -> Copiando e importando en contenedor Docker '%DOCKER_CONTAINER%'...
    docker cp "dataset_ciberbook/dataset_usuarios.json" %DOCKER_CONTAINER%:/tmp/dataset_usuarios.json
    docker exec %DOCKER_CONTAINER% mongoimport --db biblioteca --collection usuarios --file /tmp/dataset_usuarios.json --jsonArray --mode=merge
    docker cp "dataset_ciberbook/dataset_prestamos_1000.json" %DOCKER_CONTAINER%:/tmp/dataset_prestamos_1000.json
    docker exec %DOCKER_CONTAINER% mongoimport --db biblioteca --collection prestamos --file /tmp/dataset_prestamos_1000.json --jsonArray --mode=merge
    goto final
)

set "URI=mongodb://localhost:27017/biblioteca"
if "%OPCION%"=="3" (
    echo.
    set /p "URI=Ingresa la URI de MongoDB (ej: mongodb://usuario:pass@host:puerto/biblioteca): "
)

echo.
echo -> Importando 120 Usuarios reales en %URI%...
mongoimport --uri="%URI%" --collection=usuarios --file="dataset_ciberbook/dataset_usuarios.json" --jsonArray --mode=merge
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] mongoimport local retorno codigo %ERRORLEVEL%.
) else (
    echo [OK] Usuarios importados correctamente.
)

echo.
echo -> Importando 1000 Prestamos cronologicos en %URI%...
mongoimport --uri="%URI%" --collection=prestamos --file="dataset_ciberbook/dataset_prestamos_1000.json" --jsonArray --mode=merge
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] mongoimport local retorno codigo %ERRORLEVEL%.
) else (
    echo [OK] 1000 Prestamos importados exitosamente.
)

:final
echo.
echo ========================================================
echo   CARGA FINALIZADA CON EXITO
echo ========================================================
pause
