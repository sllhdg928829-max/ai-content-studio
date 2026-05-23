const apiKeyInput = document.getElementById('apiKey')
const saveBtn = document.getElementById('saveBtn')
const statusDiv = document.getElementById('status')

chrome.storage.local.get('apiKey', ({ apiKey }) => {
  if (apiKey) {
    apiKeyInput.value = apiKey
    statusDiv.textContent = '✓ API Key已配置，可以正常使用'
    statusDiv.className = 'status active'
  }
})

saveBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim()
  if (!apiKey) {
    statusDiv.textContent = '请输入有效的API Key'
    statusDiv.className = 'status inactive'
    return
  }

  await chrome.storage.local.set({ apiKey })
  statusDiv.textContent = '✓ API Key已保存！'
  statusDiv.className = 'status active'
  setTimeout(() => {
    statusDiv.textContent = '✓ API Key已配置，可以正常使用'
  }, 2000)
})
