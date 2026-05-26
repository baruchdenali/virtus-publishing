import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles, Globe, Lock, Shield } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import Logo from '@/components/Logo'

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL
  const appID = import.meta.env.VITE_APP_ID
  const redirectUri = `${window.location.origin}/api/oauth/callback`
  const state = btoa(redirectUri)

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`)
  url.searchParams.set("client_id", appID)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "profile")
  url.searchParams.set("state", state)

  return url.toString()
}

export default function Login() {
  const { data: kindeData } = trpc.kinde.getLoginUrl.useQuery(undefined, {
    retry: false,
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#1A1A1F]">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,165,92,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,165,92,0.05) 0%, transparent 70%)' }} />
          <div className="absolute top-[40%] right-[30%] w-[200px] h-[200px] rounded-full border border-[rgba(200,165,92,0.06)]" />
          <div className="absolute bottom-[30%] left-[15%] w-[150px] h-[150px] rounded-full border border-[rgba(200,165,92,0.04)]" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto px-6">
        {/* Left side - Branding */}
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

        {/* Right side - Login Card */}
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

            <div className="text-center mb-8">
              <h2 className="text-[24px] font-semibold mb-2">Welcome Back</h2>
              <p className="text-[14px] text-[#9B9589]">Sign in to access your publishing studio</p>
            </div>

            {/* Primary: Kinde Auth */}
            {kindeData?.loginUrl ? (
              <button
                onClick={() => {
                  document.cookie = `kinde_session_id=${kindeData.sessionId};path=/;max-age=604800`;
                  window.location.href = kindeData.loginUrl;
                }}
                className="w-full flex items-center justify-center gap-3 btn-gold text-[14px] py-3.5 mb-4"
              >
                <Shield className="w-5 h-5" />
                Sign in with Kinde
              </button>
            ) : null}

            {/* Secondary: Kimi Auth */}
            <button
              onClick={() => { window.location.href = getOAuthUrl() }}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[rgba(245,240,232,0.14)] text-[14px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
            >
              <Shield className="w-4 h-4 text-[#9B9589]" />
              Sign in with Kimi
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)]" />
              <span className="text-[11px] text-[#9B9589] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)]" />
            </div>

            <div className="text-center">
              <p className="text-[13px] text-[#9B9589] mb-3">New to Virtus?</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Browse the Store
              </Link>
            </div>

            <p className="text-center text-[11px] text-[#9B9589] mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              <br />
              Your data is secured with end-to-end encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
