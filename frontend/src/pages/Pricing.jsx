export default function Pricing() {
  const packages = [
    {
      id: 'basic',
      name: '基础包',
      price: '¥9.9',
      credits: 50,
      perCredit: '¥0.20',
      popular: false,
    },
    {
      id: 'pro',
      name: '专业包',
      price: '¥29.9',
      credits: 200,
      perCredit: '¥0.15',
      popular: true,
    },
    {
      id: 'enterprise',
      name: '企业包',
      price: '¥99',
      credits: 1000,
      perCredit: '¥0.10',
      popular: false,
    },
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">购买积分</h2>
        <p className="text-gray-600 mt-2">每次生成消耗1积分，选择适合你的套餐</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {packages.map(pkg => (
          <div key={pkg.id} className={`bg-white p-8 rounded-xl shadow-sm border relative ${pkg.popular ? 'ring-2 ring-indigo-500' : ''}`}>
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">
                最受欢迎
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-indigo-600">{pkg.price}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center">✓ {pkg.credits} 积分</li>
              <li className="flex items-center">✓ 约{pkg.perCredit}/次生成</li>
              <li className="flex items-center">✓ 永不过期</li>
              <li className="flex items-center">✓ 支持所有内容类型</li>
            </ul>
            <button className="mt-8 w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              购买 {pkg.name}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-yellow-800">支付说明</h3>
        <p className="text-yellow-700 text-sm mt-1">
          目前支持微信支付和支付宝。选择套餐后请联系客服获取支付二维码。
          后续版本将支持在线自动支付。
        </p>
        <p className="text-yellow-600 text-xs mt-2">
          客服微信：请联系站长获取 | 邮箱：support@example.com
        </p>
      </div>
    </div>
  )
}
