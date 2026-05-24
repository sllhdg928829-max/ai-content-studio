import { useState, useEffect } from 'react'
import api from '../api'

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('submitted')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/payment/admin/orders?status=${status}`)
      setOrders(data)
    } catch (err) {
      setMessage('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [status])

  const approveOrder = async (orderId) => {
    try {
      await api.post(`/payment/admin/approve/${orderId}`)
      setMessage(`Order ${orderId} approved!`)
      fetchOrders()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Approve failed')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">管理员面板</h2>

      {message && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>
      )}

      <div className="flex gap-2 mb-6">
        {['submitted', 'pending', 'completed'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s === 'submitted' ? '待审核' : s === 'pending' ? '未支付' : '已完成'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">订单号</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">用户ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">金额</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">积分</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">方式</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">时间</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">加载中...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">暂无数据</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm font-mono">{o.order_id}</td>
                  <td className="px-4 py-3 text-sm">{o.user_id}</td>
                  <td className="px-4 py-3 text-sm">¥{o.amount_yuan}</td>
                  <td className="px-4 py-3 text-sm">{o.credits}</td>
                  <td className="px-4 py-3 text-sm">{o.payment_method}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3 text-sm">
                    {o.status === 'submitted' && (
                      <button onClick={() => approveOrder(o.order_id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        确认收款
                      </button>
                    )}
                    {o.status === 'completed' && <span className="text-green-600">✓ 已处理</span>}
                    {o.status === 'pending' && <span className="text-gray-400">待支付</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
