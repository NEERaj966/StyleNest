import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../Context/UserDataContext.js'

const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isValid = email.includes('@') && password.length >= 6

  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    const payload = { email, password }

    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/users/login`, payload)
    if (res.status === 200) {
      const data = res.data?.data
      setUser(data?.user)
      if (data?.token) {
        localStorage.setItem('token', data.token)
      }
      navigate('/')
    }

    setEmail('')
    setPassword('')
  }

  const googleButtonRef = useRef(null)

  const handleGoogleCredential = useCallback(async (response) => {
    try {
      const credential = response?.credential
      if (!credential) return
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/users/google`, { credential })
      if (res.status === 200) {
        const data = res.data?.data
        setUser(data?.user)
        if (data?.token) {
          localStorage.setItem('token', data.token)
        }
        navigate('/')
      }
    } catch (err) {
      console.log(err)
    }
  }, [navigate, setUser])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !googleButtonRef.current) return

    const renderButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
      })
    }

    if (window.google?.accounts?.id) {
      renderButton()
      return
    }

    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer)
        renderButton()
      }
    }, 300)

    return () => clearInterval(timer)
  }, [handleGoogleCredential])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#FFF7ED]">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Welcome Back
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 lg:text-7xl">
              Find What You Love, Just a Click Away.
            </h1>
            <p className="mt-4 max-w-xl text-slate-600 text-lg lg:text-xl">
              Track your favorites, stay updated on the daily Fashion trends.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-amber-100/60 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">User Login</h2>
                <p className="mt-1 text-sm text-slate-600">Use your email or Google account.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <span className="text-xs font-semibold">SN</span>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., anjali@email.com"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Password</label>
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 
                ${
                  isValid
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
            `}
              >
                Sign in
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px w-full bg-slate-200" />
              OR
              <div className="h-px w-full bg-slate-200" />
            </div>

            <div ref={googleButtonRef} className="flex w-full justify-center" />

            <p className="mt-5 text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link className="font-semibold text-amber-700 hover:text-amber-800" to="/signup">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserLogin
