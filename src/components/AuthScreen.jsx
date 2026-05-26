import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-dark-panel border border-dark-border mx-auto flex items-center justify-center mb-4 shadow-xl">
            <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MDNotes</h1>
          <p className="text-sm text-dark-muted mt-1">Part of your MDOS workspace</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-brand-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            {/* Mode toggle */}
            <div className="flex bg-dark-bg rounded-xl p-1 mb-6 border border-dark-border">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${mode === 'login' ? 'bg-brand-600 text-white font-medium' : 'text-dark-muted hover:text-white'}`}
              >Sign In</button>
              <button
                onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${mode === 'signup' ? 'bg-brand-600 text-white font-medium' : 'text-dark-muted hover:text-white'}`}
              >Create Account</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-dark-muted mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500 transition-colors placeholder:text-dark-muted/50"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-muted mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500 transition-colors placeholder:text-dark-muted/50"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>
              )}
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">{success}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 mt-2"
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In to MDOS' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
