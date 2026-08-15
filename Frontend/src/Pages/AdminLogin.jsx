import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AdminDataContext } from '../Context/AdminDataContext.js'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isValid = email.includes('@') && password.length >= 6

  const navigate = useNavigate()
  const { setAdmin } = useContext(AdminDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    const payload = { email, password }

    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/admins/login`, payload)
    if (res.status === 200) {
      const data = res.data?.data
      setAdmin(data?.user)
      if (data?.token) {
        localStorage.setItem('adminToken', data.token)
      }
      navigate('/admin')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FFF7ED]">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b6a8] bg-[#f8f4ec] px-3 py-1 text-xs font-semibold text-[#8f3d25]">
              <span className="h-2 w-2 rounded-full bg-[#f2e4dc]0" />
              Admin Portal
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[#24211d] lg:text-7xl">
              Behind every great style is a great vision
            </h1>
            <p className="mt-4 max-w-xl text-[#5d554c]">
              Manage your store with ease. Access real-time updates, track sales, and ensure a seamless experience for your customers.
            </p>
          </div>

          <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_10px_28px_rgba(36,33,29,0.06)] shadow-amber-100/60 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#24211d]">Admin Login</h2>
                <p className="mt-1 text-sm text-[#5d554c]">Use your admin credentials.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24211d] text-[#f8f4ec]">
                <span className="text-xs font-semibold">CT</span>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold text-[#5d554c]">Email</label>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., admin@canteen.com"
                  className="mt-1 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5d554c]">Password</label>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-[#f8f4ec] hover:bg-[#302b26] 
                ${isValid ? 'bg-[#24211d] text-[#f8f4ec] hover:bg-gray-900' : 'bg-gray-300 text-[#746b61] cursor-not-allowed'}
            `}
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminLogin
