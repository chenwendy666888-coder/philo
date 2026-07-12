// /api/chat.js
// ============================================================
// 服务端代理（就是我们一直说的"中端"）
// 作用：替你握着 qwen 的 key，把浏览器发来的问题转发给通义千问。
// key 存在 Vercel 的环境变量 DASHSCOPE_API_KEY 里，只在这个服务器函数里用，
// 浏览器（前端）从头到尾看不到它 —— 这就是"不暴露 key"的关键。
// ============================================================

// qwen 的 OpenAI 兼容接口地址
const QWEN_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
// 模型名：默认用你要的 qwen3.7-plus；如果报"模型不存在"，去阿里云百炼的模型列表
// 确认准确名字，然后在 Vercel 环境变量里加一个 QWEN_MODEL 覆盖即可，不用改代码。
const MODEL = process.env.QWEN_MODEL || "qwen3.7-plus";

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只接受 POST 请求" });
  }

  // 从环境变量读 key（绝不写在代码里、也绝不发给前端）
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "服务器还没配置 key。请在 Vercel 项目的 Settings → Environment Variables 里添加 DASHSCOPE_API_KEY。"
    });
  }

  try {
    // 前端传来的：system（人设）+ messages（对话历史）
    const { system, messages } = req.body || {};

    const finalMessages = [];
    if (system) finalMessages.push({ role: "system", content: system });
    (messages || []).forEach(m => finalMessages.push({ role: m.role, content: m.content }));

    // 转发给 qwen —— key 只在这一行、只在服务器上被使用
    const r = await fetch(QWEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: finalMessages,
        temperature: 0.8,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: `模型调用失败 (${r.status})`, detail });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "（没有回应）";
    return res.status(200).json({ reply });

  } catch (e) {
    return res.status(500).json({ error: "服务端异常：" + e.message });
  }
}
