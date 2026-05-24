import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <NavLink to="/" className="text-xl font-bold text-indigo-600">
                AI Content Studio
              </NavLink>
              <div className="hidden md:flex space-x-4">
                <NavLink to="/" end className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}>
                  工作台
                </NavLink>
                <NavLink to="/generate" className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}>
                  生成内容
                </NavLink>
                <NavLink to="/pricing" className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}>
                  购买积分
                </NavLink>
                {user.is_admin && (
                  <NavLink to="/admin" className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:text-red-600'}`}>
                    管理
                  </NavLink>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                <span className="font-medium text-indigo-600">{user.credits || 0}</span> 积分
              </span>
              <span className="text-sm text-gray-600 hidden sm:inline">{user.username || user.email}</span>
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">退出</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
