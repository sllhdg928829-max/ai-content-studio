import { useState } from 'react'
import api from '../api'

const CONTENT_TYPES = [
  { value: 'blog', label: '博客文章', icon: '📝', desc: '专业的长文博客内容' },
  { value: 'social_media', label: '社交媒体', icon: '📱', desc: '小红书/微博/朋友圈' },
  { value: 'ad_copy', label: '广告文案', icon: '📢', desc: '高转化率的广告语' },
  { value: 'product_desc', label: '产品描述', icon: '🏷️', desc: '吸引人的产品介绍' },
  { value: 'email', label: '营销邮件', icon: '📧', desc: '邮件营销内容' },
  { value: 'seo', label: 'SEO内容', icon: '🔍', desc: '搜索引擎优化内容' },
]

const TONES = [
  { value: 'professional', label: '专业' },
  { value: 'casual', label: '轻松' },
  { value: 'persuasive', label: '说服力' },
  { value: 'humorous', label: '幽默' },
  { value: 'formal', label: '正式' },
]

const LENGTHS = [
  { value: 'short', label: '短 (~500字)' },
  { value: 'medium', label: '中 (~1500字)' },
  { value: 'long', label: '长 (~3000字)' },
]

export default function ContentGenerator() {
  const [form, setForm] = useState({
    content_type: 'blog',
    topic: '',
    keywords: '',
    tone: 'professional',
    language: 'zh',
    length: 'medium',
    extra_instructions: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.topic.trim()) return
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/content/generate', form)
      setResult(data)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.credits = data.credits_remaining
      localStorage.setItem('user', JSON.stringify(user))
    } catch (err) {
      setError(err.response?.data?.detail || '生成失败，请重试')
      if (err.response?.status === 402) {
        setError('积分不足！请先购买积分')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyContent = () => {
    navigator.clipboard.writeText(result.generated_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">生成内容</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
            <div className="grid grid-cols-3 gap-2">
              {CONTENT_TYPES.map(ct => (
                <button key={ct.value} type="button"
                  onClick={() => setForm({...form, content_type: ct.value})}
                  className={`p-3 rounded-lg border text-center text-sm transition ${form.content_type === ct.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-xl">{ct.icon}</div>
                  <div className="font-medium mt-1">{ct.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">主题/关键词 *</label>
            <input type="text" required value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
              placeholder="例如：如何提高工作效率、新品发布促销..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SEO关键词（可选）</label>
            <input type="text" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})}
              placeholder="用逗号分隔多个关键词"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">语气风格</label>
              <select value={form.tone} onChange={e => setForm({...form, tone: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
              <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">长度</label>
              <select value={form.length} onChange={e => setForm({...form, length: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg">
                {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">额外要求（可选）</label>
            <textarea value={form.extra_instructions} onChange={e => setForm({...form, extra_instructions: e.target.value})}
              placeholder="任何特别的格式、风格或内容要求..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <button type="submit" disabled={loading || !form.topic.trim()}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-lg font-medium">
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI正在创作中...
              </span>
            ) : '开始生成 (消耗1积分)'}
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">生成结果</h2>
          {result && (
            <button onClick={copyContent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              {copied ? '已复制！' : '复制内容'}
            </button>
          )}
        </div>
        {loading ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-bounce">🤖</div>
              <p className="text-gray-600">AI正在为你创作优质内容...</p>
              <p className="text-gray-400 text-sm mt-2">这可能需要10-30秒</p>
            </div>
          </div>
        ) : result ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-400 mb-2">剩余积分: {result.credits_remaining}</div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
              {result.generated_content}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-4">✨</div>
              <p>填写左侧表单，AI将为你生成内容</p>
              <p className="text-sm mt-2">支持博客、广告、社交媒体等多种类型</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
