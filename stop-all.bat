@echo off
echo Stopping Idea Hub...
echo.
echo Stopping Docker containers...
docker-compose down
echo.
echo Done! All services stopped.
pause
