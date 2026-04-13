@echo off
title AI Career Copilot
echo =======================================================
echo Starting AI Career Copilot Servers...
echo =======================================================

echo.
echo [1/2] Starting Django Backend Server...
start "Backend Server" cmd /k "cd backend && call .venv\Scripts\activate && python manage.py runserver"

echo.
echo [2/2] Starting React (Vite) Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo Both servers have been started in new command windows.
echo - Backend (Django): http://localhost:8000
echo - Frontend (React): http://localhost:5173
echo =======================================================
