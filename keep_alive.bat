@echo off
title AI Content Studio - Keep Alive (Auto Restart)
echo ============================================
echo  AI Content Studio - AUTO RESTART MODE
echo  If backend or tunnel dies, it auto-restarts
echo ============================================

:loop
echo.
echo [%date% %time%] Checking services...

REM Check and start backend
netstat -ano | find ":8000" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo [!] Backend DOWN. Restarting...
    start "AI-Backend" cmd /c "cd backend && set DEEPSEEK_API_KEY=sk-fb507f10684c468680f987998758618a && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] Backend running
)

REM Check and start cloudflared tunnel
netstat -ano | find ":8000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    tasklist | find "cloudflared.exe" >nul
    if %errorlevel% neq 0 (
        echo [!] Tunnel DOWN. Restarting...
        start "AI-Tunnel" cmd /c "C:\Users\dell\cloudflared.exe tunnel --url http://localhost:8000"
        timeout /t 10 /nobreak >nul
    ) else (
        echo [OK] Tunnel running
    )
)

echo Waiting 60 seconds before next check...
timeout /t 60 /nobreak >nul
goto loop
