import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">AI Content Studio</h2>
          <p className="mt-2 text-center text-sm text-gray-600">注册即送5积分免费试用</p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? '注册中...' : '注册并获取5积分'}
          </button>
          <p className="text-center text-sm text-gray-600">
            已有账号？ <Link to="/login" className="text-indigo-600 hover:text-indigo-500">立即登录</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
