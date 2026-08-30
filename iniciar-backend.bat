@echo off
title Backend MiBarber (Spring Boot)
echo ==========================================
echo    Iniciando Backend MiBarber (Java 17)
echo ==========================================

set JAVA_HOME=%LOCALAPPDATA%\Programs\jdk-17
set PATH=%LOCALAPPDATA%\Programs\apache-maven\bin;%LOCALAPPDATA%\Programs\jdk-17\bin;%PATH%

cd /d "%~dp0backend"
mvn spring-boot:run
pause
