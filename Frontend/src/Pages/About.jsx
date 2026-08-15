import React, { useState } from 'react'
import axios from 'axios'

const About = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(false)

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/feedback`, {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      })

      if (res.status === 201 || res.status === 200) {
        setSubmitted(true)
        setForm({ name: '', email: '', message: '' })
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <section className="bg-[#f8f4ec] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8f3d25]">About us</p>
            <h2 className="mt-3 text-3xl font-bold text-[#24211d] sm:text-4xl">
              Built for faster, smarter canteen service
            </h2>
            <p className="mt-4 text-sm text-[#5d554c]">
              We help students and staff get fresh meals without waiting. Our platform keeps menus updated, streamlines
              pickups, and gives every canteen the tools to manage demand in real time.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-100 bg-[#f2e4dc]/50 p-4">
                <p className="text-sm font-semibold text-[#24211d]">Daily specials</p>
                <p className="mt-1 text-xs text-[#5d554c]">New menu items and bundle offers every day.</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-[#f2e4dc]/50 p-4">
                <p className="text-sm font-semibold text-[#24211d]">Real-time updates</p>
                <p className="mt-1 text-xs text-[#5d554c]">Instant updates for sold out items.</p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
              <h3 className="text-base font-semibold text-[#24211d]">Our promise</h3>
              <p className="mt-3 text-sm text-[#5d554c]">
                We keep menus accurate, pickups fast, and feedback loops open so every meal feels effortless.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#24211d]">Share feedback</h3>
                <p className="mt-1 text-sm text-[#5d554c]">Tell us what can be better.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24211d] text-[#f8f4ec]">
                <span className="text-xs font-semibold">CT</span>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold text-[#5d554c]">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5d554c]">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#5d554c]">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Share your feedback"
                  rows="4"
                  className="mt-1 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#24211d] px-4 py-2.5 text-sm font-semibold text-[#f8f4ec] hover:bg-[#302b26]"
              >
                Send feedback
              </button>
              {submitted && <p className="text-xs text-emerald-600">Thanks! Your feedback was sent.</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
