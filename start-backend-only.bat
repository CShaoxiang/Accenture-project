@echo off
echo Starting Backend Server...
cd /d "%~dp0packages\backend"
call npm run dev
