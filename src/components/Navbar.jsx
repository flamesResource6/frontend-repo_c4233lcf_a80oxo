import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate()

  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem('token'))
      const raw = localStorage.getItem('user')
      setUser(raw ? JSON.parse(raw) : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white/80 backdrop-blur border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">GameStore</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">হোম</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-700 hover:text-indigo-600">অ্যাডমিন</Link>
          )}
          {token ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.name}</span>
              <button onClick={logout} className="px-3 py-1.5 bg-gray-800 text-white rounded hover:bg:black">লগআউট</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">লগইন</Link>
              <Link to="/register" className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200">রেজিস্ট্রেশন</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
