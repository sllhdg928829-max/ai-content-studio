@echo off
title AI Content Studio
echo ============================================
echo  AI Content Studio - One Click Start
echo ============================================

REM Kill old instances
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq AI-Backend*" 2>nul
taskkill /F /IM "cloudflared.exe" 2>nul

REM Start backend
echo [1/3] Starting backend server...
start "AI-Backend" cmd /c "cd backend && set DEEPSEEK_API_KEY=sk-fb507f10684c468680f987998758618a && set PUBLIC_BACKEND_URL=https://localhost:8000 && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

REM Start Cloudflare Tunnel
echo [2/3] Creating public tunnel...
start "AI-Tunnel" cmd /c "C:\Users\dell\cloudflared.exe tunnel --url http://localhost:8000"
timeout /t 8 /nobreak >nul

echo [3/3] Done!
echo ============================================
echo  Backend:   http://localhost:8000
echo  Frontend:  https://sllhdg928829-max.github.io/ai-content-studio/
echo  Tunnel:    Check the AI-Tunnel window for URL
echo.
echo  Keep-alive: Run keep_alive.bat for auto-restart
echo ============================================
echo.
echo WARNING: Closing this window will NOT stop services.
echo Use Task Manager to stop python.exe and cloudflared.exe
pause
