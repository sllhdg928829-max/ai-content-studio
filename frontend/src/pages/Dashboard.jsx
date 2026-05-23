import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/auth/history').then(({ data }) => setHistory(data)).catch(() => {})
  }, [])

  const contentTypes = {
    blog: '博客文章',
    social_media: '社交媒体',
    ad_copy: '广告文案',
    product_desc: '产品描述',
    email: '营销邮件',
    seo: 'SEO内容',
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">欢迎回来，{user.username || user.email}</h2>
        <p className="text-gray-600 mt-1">剩余积分: <span className="font-bold text-indigo-600">{user.credits || 0}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/generate" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">✍️</div>
          <h3 className="font-semibold text-gray-900">生成内容</h3>
          <p className="text-sm text-gray-600 mt-1">创建博客、广告、社交媒体内容</p>
        </Link>
        <Link to="/pricing" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">💎</div>
          <h3 className="font-semibold text-gray-900">购买积分</h3>
          <p className="text-sm text-gray-600 mt-1">解锁更多内容生成次数</p>
        </Link>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">使用统计</h3>
          <p className="text-sm text-gray-600 mt-1">已生成 {history.length} 篇内容</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近生成</h3>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有生成过内容，<Link to="/generate" className="text-indigo-600">开始创作</Link></p>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 10).map(item => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{contentTypes[item.content_type] || item.content_type}</span>
                    <span className="ml-2 font-medium text-gray-900">{item.topic}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.generated_content?.substring(0, 200)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
