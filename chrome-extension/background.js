chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-polish',
    title: 'AI润色',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    id: 'ai-translate-zh',
    title: 'AI翻译成中文',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    id: 'ai-translate-en',
    title: 'AI翻译成英文',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    id: 'ai-expand',
    title: 'AI续写',
    contexts: ['selection'],
  })
  chrome.contextMenus.create({
    id: 'ai-summarize',
    title: 'AI摘要',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return

  const actionMap = {
    'ai-polish': '请润色优化以下文本，使其更流畅自然，保持原意不变：',
    'ai-translate-zh': '请将以下内容翻译成中文：',
    'ai-translate-en': '请将以下内容翻译成英文：',
    'ai-expand': '请基于以下内容进行续写扩展，保持风格一致：',
    'ai-summarize': '请对以下内容进行简洁的摘要总结：',
  }

  const prompt = actionMap[info.menuItemId] || actionMap['ai-polish']

  try {
    const result = await callDeepSeek(prompt + '\n\n' + info.selectionText)

    chrome.tabs.sendMessage(tab.id, {
      action: 'showResult',
      text: result,
      originalText: info.selectionText,
    })
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showError',
      error: err.message,
    })
  }
})

async function callDeepSeek(prompt) {
  const { apiKey } = await chrome.storage.local.get('apiKey')
  if (!apiKey) throw new Error('请先在扩展设置中配置DeepSeek API Key')

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的写作助手。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  const data = await response.json()
  if (!data.choices) throw new Error(data.error?.message || '请求失败')
  return data.choices[0].message.content
}
