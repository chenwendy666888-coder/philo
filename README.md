# 哲学家对话 · 可部署版

一个能安全部署到 Vercel 的网站：几位著名哲学家由 AI 扮演，你可以跟他们对话、保存、导出。
调用的是通义千问（qwen），key 存在服务器环境变量里，浏览器看不到。

## 文件结构
- `index.html` —— 前端页面（用户看到的界面）
- `api/chat.js` —— 服务端代理（握着 key，转发给 qwen）

## 部署到 Vercel（三步）
1. 把这个文件夹推到一个 GitHub 仓库。
2. 打开 vercel.com → New Project → 选中这个仓库 → Deploy。
3. 部署后进入项目 Settings → Environment Variables，添加：
   - `DASHSCOPE_API_KEY` = 你自己的 qwen key（sk- 开头）
   - （可选）`QWEN_MODEL` = qwen3.7-plus  ← 如果这个名字报"模型不存在"，
     去阿里云百炼的模型列表换成准确名字（如 qwen-plus），填在这里即可，不用改代码。
   加完变量后点 Redeploy 让它生效。

## 重要安全提醒
- key 只填在 Vercel 环境变量里，**不要**写进代码、**不要**提交到 GitHub。
- 本地测试时把 key 放进 `.env`（已被 .gitignore 忽略），不会被上传。

## 本地跑（可选）
装好 Node 后：`npx vercel dev`，会在本地起一个带 /api 的服务。
