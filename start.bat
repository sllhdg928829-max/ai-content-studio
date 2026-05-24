@echo off
echo ============================================
echo  AI Content Studio - One Click Start
echo ============================================

REM Start backend
echo [1/2] Starting backend server...
start "AI-Backend" cmd /k "cd backend && set DEEPSEEK_API_KEY=sk-fb507f10684c468680f987998758618a && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

REM Start tunnel
echo [2/2] Creating public tunnel...
start "AI-Tunnel" cmd /k "npx localtunnel --port 8000"
timeout /t 5 /nobreak >nul

echo ============================================
echo  Backend running at: http://localhost:8000
echo  Tunnel URL: check the tunnel window
echo  Frontend: run 'cd frontend && npm run dev'
echo ============================================
pause
