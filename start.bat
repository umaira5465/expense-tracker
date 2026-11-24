@echo off
echo Starting Expense Tracker...

start "Backend (port 5050)" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend:  http://localhost:5050/api/expenses
echo Frontend: open the "Local:" link shown in the Frontend window (usually http://localhost:5173)
pause
