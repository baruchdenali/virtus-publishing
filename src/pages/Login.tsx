import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Globe, Lock, LogIn, UserPlus } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import Logo from '@/components/Logo'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (err) => setError(err.message),
  })

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (err) => setError(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!name.trim()) { setError('Name is required'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return }
      registerMutation.mutate({ name, email, password })
    } else {
      loginMutation.mutate({ email, password })
    }
  }

  const isPending = registerMutation.isPending || loginMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#1A1A1F]">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,165,92,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,165,92,0.05) 0%, transparent 70%)' }} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto px-6">
        {/* Left side — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-start max-w-md"
        >
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.02em] mb-4">
            The Elite Platform for
            <span className="text-gradient-gold"> Serious Authors</span>
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#9B9589] mb-8">
            Create, publish, and distribute professional eBooks with the power of AI.
            Join the most advanced publishing ecosystem on the web.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: Sparkles, text: 'AI-Powered Writing Assistant' },
              { icon: BookOpen, text: 'Professional eBook Publishing' },
              { icon: Globe, text: 'Integrated Digital Bookstore' },
              { icon: Lock, text: 'Military-Grade Encryption' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(200,165,92,0.08)] flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-[#C8A55C]" />
                </div>
                <span className="text-[14px] text-[#F5F0E8]">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side — Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[420px]"
        >
          <div className="glass-surface p-8 md:p-10" style={{ border: '1px solid rgba(200,165,92,0.12)', boxShadow: '0 0 40px rgba(200,165,92,0.06), 0 12px 40px rgba(0,0,0,0.40)' }}>
            <div className="lg:hidden flex items-center justify-center mb-6">
              <Logo size="md" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-[24px] font-semibold mb-1">
                {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-[14px] text-[#9B9589]">
                {mode === 'register' ? 'Join Virtus Publishing today' : 'Sign in to your account'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[rgba(245,240,232,0.04)]">
              <button
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${mode === 'login' ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'text-[#9B9589] hover:text-[#F5F0E8]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError('') }}
                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${mode === 'register' ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'text-[#9B9589] hover:text-[#F5F0E8]'}`}
              >
                New Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[13px] text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field text-[14px]"
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field text-[14px]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field text-[14px]"
                  placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 btn-gold text-[14px] py-3.5 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="animate-pulse">Processing...</span>
                ) : mode === 'register' ? (
                  <><UserPlus className="w-5 h-5" />Create Account</>
                ) : (
                  <><LogIn className="w-5 h-5" />Sign In</>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)]" />
              <span className="text-[11px] text-[#9B9589] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)]" />
            </div>

            <div className="text-center">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Browse the Store
              </Link>
            </div>

            <p className="text-center text-[11px] text-[#9B9589] mt-6 leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is secured with end-to-end encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
