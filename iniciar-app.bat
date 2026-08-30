@echo off
title MiBarber Launcher
echo ==========================================
echo    Iniciando MiBarber (Backend + Frontend)
echo ==========================================

start "MiBarber Backend" cmd /c "%~dp0iniciar-backend.bat"
timeout /t 3 /nobreak >nul
start "MiBarber Frontend" cmd /c "%~dp0iniciar-frontend.bat"

echo.
echo Todo listo! Podes abrir en tu navegador:
echo   Frontend: http://localhost:5173
echo   Backend / API: http://localhost:8080/api/cortes
echo   Consola H2 DB: http://localhost:8080/h2-console
echo.
pause
