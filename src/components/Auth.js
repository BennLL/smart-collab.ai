import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // 1. Supabase signUp
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // 2. If signUp successful, insert profile
    const user = data?.user
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, first_name: firstName, last_name: lastName }])
      if (profileError) setError(profileError.message)
    }
    setLoading(false)
  }

  return (
    <div className="w-[600px] h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-6xl font-bold text-indigo-700 mb-1 text-center">
          Smart Collab
        </h2>
        <p className="text-gray-500 mb-7 text-center">
          Together, anything is possible.
        </p>
        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {/* --- Sign Up form --- */}
        <form className="flex flex-col gap-2 mt-6" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 text-md rounded-lg border border-gray-300 focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <a href="#" className="mt-2 text-sm text-gray-500 hover:text-indigo-700 hover:underline">
          Forgot password?
        </a>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  )
}

export default Auth
