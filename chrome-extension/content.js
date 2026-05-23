let floatingBox = null

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showResult') {
    showFloatingBox(message.text, message.originalText)
  } else if (message.action === 'showError') {
    showError(message.error)
  }
})

function showFloatingBox(text, originalText) {
  removeFloatingBox()

  floatingBox = document.createElement('div')
  floatingBox.id = 'ai-writing-assistant-box'
  floatingBox.innerHTML = `
    <div class="aiwa-header">
      <span>AI 写作助手</span>
      <div class="aiwa-buttons">
        <button id="aiwa-replace" class="aiwa-btn aiwa-btn-primary">替换原文</button>
        <button id="aiwa-copy" class="aiwa-btn">复制</button>
        <button id="aiwa-close" class="aiwa-btn aiwa-btn-close">✕</button>
      </div>
    </div>
    <div class="aiwa-original">
      <div class="aiwa-label">原文：</div>
      <div class="aiwa-content">${escapeHtml(originalText.substring(0, 300))}${originalText.length > 300 ? '...' : ''}</div>
    </div>
    <div class="aiwa-result">
      <div class="aiwa-label">AI结果：</div>
      <div class="aiwa-content">${escapeHtml(text)}</div>
    </div>
  `

  document.body.appendChild(floatingBox)

  document.getElementById('aiwa-close').onclick = removeFloatingBox
  document.getElementById('aiwa-copy').onclick = () => {
    navigator.clipboard.writeText(text)
    const btn = document.getElementById('aiwa-copy')
    btn.textContent = '已复制!'
    setTimeout(() => { btn.textContent = '复制' }, 2000)
  }
  document.getElementById('aiwa-replace').onclick = () => {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT' || activeEl.isContentEditable)) {
      if (activeEl.isContentEditable) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(document.createTextNode(text))
        }
      } else {
        const start = activeEl.selectionStart
        const end = activeEl.selectionEnd
        activeEl.setRangeText(text, start, end, 'select')
      }
    }
    removeFloatingBox()
  }
}

function showError(error) {
  removeFloatingBox()
  floatingBox = document.createElement('div')
  floatingBox.id = 'ai-writing-assistant-box'
  floatingBox.className = 'aiwa-error'
  floatingBox.innerHTML = `
    <div class="aiwa-header">
      <span>错误</span>
      <button id="aiwa-close" class="aiwa-btn aiwa-btn-close">✕</button>
    </div>
    <div class="aiwa-error-msg">${escapeHtml(error)}</div>
  `
  document.body.appendChild(floatingBox)
  document.getElementById('aiwa-close').onclick = removeFloatingBox
}

function removeFloatingBox() {
  if (floatingBox) {
    floatingBox.remove()
    floatingBox = null
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
