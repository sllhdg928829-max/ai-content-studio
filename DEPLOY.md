# AI Content Studio - 部署指南

## 一、部署前端到 Vercel (免费)

1. 打开 https://vercel.com
2. 点击 "Sign Up" → "Continue with GitHub" 登录
3. 点击 "New Project"
4. 选择 `sllhdg928829-max/ai-content-studio`
5. Framework 选择 "Vite"
6. Root Directory 改为 `frontend`
7. 点击 Deploy
8. 获得前端域名如 `https://ai-content-studio.vercel.app`

## 二、部署后端到 Render (免费)

1. 打开 https://render.com
2. 点击 "Sign Up" → "Sign in with GitHub"
3. 点击 "New +" → "Web Service"
4. 选择仓库 `sllhdg928829-max/ai-content-studio`
5. 配置:
   - Name: ai-content-studio-api
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
6. 添加环境变量:
   - DEEPSEEK_API_KEY: sk-fb507f10684c468680f987998758618a
   - SECRET_KEY: ai-content-studio-prod-secret-2024
7. 点击 "Create Web Service"
8. 获得后端域名如 `https://ai-content-studio-api.onrender.com`

## 三、更新前端API地址

部署后端后, 需要更新 `frontend/vite.config.js` 中的proxy或直接使用后端URL。

## 四、Chrome扩展

1. 打开 Chrome → 地址栏输入 `chrome://extensions/`
2. 开启右上角"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `chrome-extension` 文件夹
5. 在扩展弹窗中配置 DeepSeek API Key

## GitHub 仓库
https://github.com/sllhdg928829-max/ai-content-studio
