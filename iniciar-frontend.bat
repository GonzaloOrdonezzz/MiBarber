@echo off
title Frontend MiBarber (React + Vite)
echo ==========================================
echo    Iniciando Frontend MiBarber (React)
echo ==========================================

set PATH=C:\Program Files\nodejs;%PATH%

cd /d "%~dp0frontend"
npm run dev
pause
