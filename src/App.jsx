import { useEffect, useState } from 'react'
import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Home() {
  const [games, setGames] = useState([])
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (platform) params.set('platform', platform)
    const res = await fetch(`${API}/games?${params.toString()}`)
    const data = await res.json()
    setGames(data)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="গেম সার্চ করুন" className="w-full sm:flex-1 border rounded px-3 py-2" />
        <select value={platform} onChange={e=>setPlatform(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All</option>
          <option value="PC">PC</option>
          <option value="Mobile">Mobile</option>
        </select>
        <button onClick={fetchGames} className="px-4 py-2 bg-indigo-600 text-white rounded">সার্চ</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(g => (
          <div key={g._id} className="bg-white rounded shadow p-4 flex flex-col">
            <img src={g.images?.[0] || 'https://via.placeholder.com/400x240?text=Game'} alt={g.title} className="w-full h-40 object-cover rounded" />
            <h3 className="mt-3 text-lg font-semibold">{g.title}</h3>
            <p className="text-xs text-gray-500">{g.platform} {g.category?`• ${g.category}`:''}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold">৳ {g.price}</span>
              <Link to={`/game/${g._id}`} className="px-3 py-1.5 bg-gray-900 text-white rounded">ডিটেইলস</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GameDetail({ id }) {
  const [game, setGame] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/games/${id}`).then(r=>r.json()).then(setGame)
  }, [id])

  const placeOrder = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token?{Authorization: `Bearer ${token}`}:{}) },
      body: JSON.stringify({ game_id: id, transaction_id: transactionId, delivery_email: email }),
    })
    const data = await res.json()
    if (res.ok) {
      alert('অর্ডার নেয়া হয়েছে! ভেরিফিকেশনের পর ২ ঘণ্টার মধ্যে ইমেইলে পাবেন।')
      navigate('/orders')
    } else {
      alert(data.detail || 'অর্ডার করা যায়নি')
    }
  }

  if (!game) return <div className="max-w-4xl mx-auto p-6">লোড হচ্ছে...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <img src={game.images?.[0] || 'https://via.placeholder.com/600x400?text=Game'} className="w-full h-72 object-cover rounded" />
      <div>
        <h2 className="text-2xl font-bold">{game.title}</h2>
        <p className="text-gray-600 mb-2">{game.platform} {game.category?`• ${game.category}`:''}</p>
        <p className="mb-4 text-sm text-gray-700">{game.description}</p>
        <div className="text-xl font-bold mb-4">৳ {game.price}</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nagad Transaction ID</label>
            <input value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="TRXID" />
          </div>
          <div>
            <label className="block text-sm mb-1">ডেলিভারি ইমেইল</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" type="email" placeholder="you@example.com" />
          </div>
          <button onClick={placeOrder} className="w-full bg-indigo-600 text-white py-2 rounded">অর্ডার করুন</button>
        </div>
      </div>
    </div>
  )
}

function GameDetailPage({ params }) {
  const id = window.location.pathname.split('/').pop()
  return <GameDetail id={id} />
}

function AuthPage({ mode }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async () => {
    const path = mode === 'login' ? '/auth/login' : '/auth/register'
    const body = mode === 'login' ? { email, password } : { name, email, password }
    const res = await fetch(`${API}${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }))
      navigate('/')
    } else {
      alert(data.detail || 'ব্যর্থ')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{mode==='login'?'লগইন':'রেজিস্ট্রেশন'}</h2>
      {mode !== 'login' && (
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="নাম" className="w-full border rounded px-3 py-2 mb-3" />
      )}
      <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="ইমেইল" className="w-full border rounded px-3 py-2 mb-3" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="পাসওয়ার্ড" className="w-full border rounded px-3 py-2 mb-4" />
      <button onClick={submit} className="w-full bg-indigo-600 text-white py-2 rounded">{mode==='login'?'লগইন':'রেজিস্টার'}</button>
    </div>
  )
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const token = localStorage.getItem('token')

  useEffect(()=>{
    if (token) {
      fetch(`${API}/orders/mine`, { headers: { Authorization: `Bearer ${token}` }})
        .then(r=>r.json()).then(setOrders)
    }
  },[])

  if (!token) return <div className="max-w-4xl mx-auto p-6">দয়া করে লগইন করুন।</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">আমার অর্ডার</h2>
      <div className="space-y-3">
        {orders.map(o=> (
          <div key={o._id} className="p-4 bg-white rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">TRX: {o.transaction_id}</div>
              <div className="text-sm text-gray-600">স্ট্যাটাস: {o.status}</div>
            </div>
            <div className="text-sm">ইমেইল: {o.delivery_email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminPage() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [games, setGames] = useState([])
  const [orders, setOrders] = useState([])

  const [form, setForm] = useState({ title:'', platform:'PC', price:'', description:'', images:'', category:'' })

  const load = async () => {
    const gs = await fetch(`${API}/games`).then(r=>r.json())
    setGames(gs)
    if (token) {
      const os = await fetch(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json())
      setOrders(os)
    }
  }

  useEffect(()=>{ load() },[])

  if (!token || user?.role !== 'admin') return <div className="max-w-4xl mx-auto p-6">অ্যাডমিন লগইন প্রয়োজন</div>

  const addGame = async () => {
    const payload = { ...form, price: parseFloat(form.price||'0'), images: form.images? form.images.split(',').map(s=>s.trim()):[] }
    const res = await fetch(`${API}/admin/games`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    if (res.ok) { setForm({ title:'', platform:'PC', price:'', description:'', images:'', category:'' }); load() } else { alert('Failed') }
  }

  const updateOrder = async (id, status) => {
    await fetch(`${API}/admin/orders/${id}/status`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-white rounded shadow p-4">
        <h3 className="font-bold mb-3">নতুন গেম এড</h3>
        <input className="w-full border rounded px-3 py-2 mb-2" placeholder="টাইটেল" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <select className="w-full border rounded px-3 py-2 mb-2" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
          <option>PC</option>
          <option>Mobile</option>
        </select>
        <input className="w-full border rounded px-3 py-2 mb-2" placeholder="দাম" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
        <input className="w-full border rounded px-3 py-2 mb-2" placeholder="ইমেজ URL (কমা দিয়ে আলাদা)" value={form.images} onChange={e=>setForm({...form,images:e.target.value})} />
        <input className="w-full border rounded px-3 py-2 mb-2" placeholder="ক্যাটাগরি" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="ডেসক্রিপশন" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <button onClick={addGame} className="w-full bg-indigo-600 text-white py-2 rounded">এড করুন</button>
      </div>

      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-3">সব গেম</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map(g=> (
              <div key={g._id} className="border rounded p-3">
                <img src={g.images?.[0] || 'https://via.placeholder.com/300x180'} className="w-full h-28 object-cover rounded" />
                <div className="font-semibold mt-2">{g.title}</div>
                <div className="text-sm text-gray-600">৳ {g.price} • {g.platform}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-bold mb-3">অর্ডার</h3>
          <div className="space-y-3">
            {orders.map(o=> (
              <div key={o._id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">TRX: {o.transaction_id}</div>
                  <div className="text-sm text-gray-600">ইমেইল: {o.delivery_email}</div>
                  <div className="text-sm">স্ট্যাটাস: {o.status}</div>
                </div>
                <div className="flex gap-2">
                  {['pending','verified','delivered','cancelled'].map(s=> (
                    <button key={s} onClick={()=>updateOrder(o._id, s)} className={`px-2 py-1 rounded text-white ${s==='delivered'?'bg-green-600': s==='verified'?'bg-blue-600': s==='cancelled'?'bg-red-600':'bg-gray-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      {children}
      <footer className="text-center text-xs text-gray-600 py-6">Nagad Send Money Only • Provide TRX ID • Receive game within 2 hours</footer>
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  )
}

export default App
