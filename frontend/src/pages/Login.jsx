import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { setApiBaseUrl, getApiBaseUrl } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl())
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查网络或API地址')
    } finally {
      setLoading(false)
    }
  }

  const saveApiUrl = () => {
    if (apiUrl.trim()) {
      setApiBaseUrl(apiUrl.trim())
      setShowSettings(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">AI Content Studio</h2>
          <p className="mt-2 text-center text-sm text-gray-600">登录你的账号</p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? '登录中...' : '登录'}
          </button>
          <p className="text-center text-sm text-gray-600">
            还没有账号？ <Link to="/register" className="text-indigo-600 hover:text-indigo-500">立即注册</Link>
          </p>
          <p className="text-center">
            <button type="button" onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-gray-400 hover:text-gray-600">
              {showSettings ? '隐藏设置' : 'API服务器设置'}
            </button>
          </p>
          {showSettings && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block text-xs font-medium text-gray-600 mb-1">API服务器地址</label>
              <div className="flex gap-2">
                <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                  placeholder="https://xxx.trycloudflare.com/api"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" />
                <button type="button" onClick={saveApiUrl}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                  保存
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">默认为：{import.meta.env.VITE_API_URL}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
