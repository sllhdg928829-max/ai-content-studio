import { useState } from 'react'
import api from '../api'

const packages = [
  { id: 'basic', name: '基础包', price: '¥9.9', credits: 50, perCredit: '¥0.20', popular: false },
  { id: 'pro', name: '专业包', price: '¥29.9', credits: 200, perCredit: '¥0.15', popular: true },
  { id: 'enterprise', name: '企业包', price: '¥99', credits: 1000, perCredit: '¥0.10', popular: false },
]

export default function Pricing() {
  const [step, setStep] = useState('select')
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('wechat')
  const [order, setOrder] = useState(null)
  const [transId, setTransId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleBuy = async (pkg) => {
    setSelectedPkg(pkg)
    setSubmitting(true)
    setMessage('')
    try {
      const { data } = await api.post(`/payment/create-order?package_id=${pkg.id}&payment_method=${paymentMethod}`)
      setOrder(data)
      setStep('pay')
    } catch (err) {
      setMessage(err.response?.data?.detail || '创建订单失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPayment = async () => {
    if (!transId.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/payment/verify-payment?order_id=${order.order_id}&transaction_id=${transId}`)
      setStep('done')
    } catch (err) {
      setMessage(err.response?.data?.detail || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'pay' && order) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">扫码支付</h2>
          <div className="text-6xl font-bold text-indigo-600 mb-2">¥{order.amount_yuan}</div>
          <p className="text-gray-600 mb-6">{order.package_name} · {order.credits}积分</p>

          <div className="bg-gray-100 rounded-lg p-8 mb-6 mx-auto w-48 h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">{paymentMethod === 'wechat' ? '💚' : '💙'}</div>
              <div className="text-sm text-gray-500">{paymentMethod === 'wechat' ? '微信支付' : '支付宝'}</div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            请使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫描二维码支付
            <br />订单号: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{order.order_id}</code>
          </p>

          <div className="border-t pt-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">支付完成后，请填写微信/支付宝交易单号</p>
            <input type="text" value={transId} onChange={e => setTransId(e.target.value)}
              placeholder="交易单号（如：4200001234567890123）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          {message && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{message}</div>}

          <div className="flex gap-3">
            <button onClick={() => setStep('select')} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              返回
            </button>
            <button onClick={handleSubmitPayment} disabled={submitting}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? '提交中...' : '我已完成支付'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">支付凭证已提交</h2>
          <p className="text-gray-600 mb-2">订单号: {order?.order_id}</p>
          <p className="text-gray-500 text-sm">管理员将在24小时内审核并添加积分，请耐心等待</p>
          <button onClick={() => { setStep('select'); setOrder(null) }}
            className="mt-6 py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">购买积分</h2>
        <p className="text-gray-600 mt-2">每次生成消耗1积分，选择适合你的套餐</p>
        {user.is_admin && (
          <p className="text-xs text-indigo-600 mt-1">管理员模式：可直接审核订单</p>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-8">
        <button onClick={() => setPaymentMethod('wechat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${paymentMethod === 'wechat' ? 'bg-green-100 text-green-700 ring-1 ring-green-500' : 'bg-gray-100 text-gray-600'}`}>
          💚 微信支付
        </button>
        <button onClick={() => setPaymentMethod('alipay')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${paymentMethod === 'alipay' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500' : 'bg-gray-100 text-gray-600'}`}>
          💙 支付宝
        </button>
      </div>

      {message && <div className="max-w-4xl mx-auto mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {packages.map(pkg => (
          <div key={pkg.id} className={`bg-white p-8 rounded-xl shadow-sm border relative ${pkg.popular ? 'ring-2 ring-indigo-500' : ''}`}>
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">最受欢迎</span>
            )}
            <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-indigo-600">{pkg.price}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>✓ {pkg.credits} 积分</li>
              <li>✓ 约{pkg.perCredit}/次生成</li>
              <li>✓ 永不过期</li>
              <li>✓ 支持所有内容类型</li>
            </ul>
            <button onClick={() => handleBuy(pkg)} disabled={submitting}
              className="mt-8 w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
              {submitting ? '处理中...' : `购买 ${pkg.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
