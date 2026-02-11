@echo off
echo Starting Frontend Server...
cd /d "%~dp0packages\frontend"
call npm run dev
