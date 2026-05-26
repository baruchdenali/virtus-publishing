import { Outlet, useLocation, Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Search, Menu, X, Sparkles, BookOpen, Store, LayoutDashboard, Settings, LogOut, BarChart3, Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Logo from '@/components/Logo'

export default function AppShell() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { lang, setLang, languages } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isRtl = lang === 'he' || lang === 'ar'

  const navLinks = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/store', label: 'Store', icon: Store },
    ...(isAuthenticated ? [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ] : []),
    ...(isAdmin ? [
      { path: '/admin', label: 'Admin', icon: BarChart3 },
    ] : []),
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#1A1A1F] text-[#F5F0E8]">
      {/* Nav Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-[rgba(245,240,232,0.06)]" style={{ background: 'rgba(26,26,31,0.88)', backdropFilter: 'blur(16px)' }} dir="ltr">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Logo size="md" />

          {/* Center links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-[#F5F0E8] bg-[rgba(200,165,92,0.12)]'
                    : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{lang}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[rgba(245,240,232,0.08)] shadow-lg z-50 py-1 max-h-64 overflow-y-auto" style={{ background: '#232328' }}>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium transition-all ${
                          lang === l.code
                            ? 'text-[#C8A55C] bg-[rgba(200,165,92,0.08)]'
                            : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase w-6">{l.flag}</span>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/create"
                  className="hidden sm:flex items-center gap-2 btn-gold text-[13px] py-2 px-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create eBook
                </Link>
                <Link to="/settings" className="w-9 h-9 rounded-full bg-[#2E2E35] flex items-center justify-center text-[14px] font-semibold text-[#F5F0E8] hover:bg-[#3a3a42] transition-colors">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link to="/login" className="btn-gold text-[13px] py-2 px-5">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#F5F0E8]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Command Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 h-12 border-b border-[rgba(245,240,232,0.04)]" style={{ background: 'rgba(26,26,31,0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-[1200px] mx-auto h-full flex items-center px-6 lg:px-12">
          <div className={`flex-1 max-w-xl flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            searchFocused
              ? 'border-[#C8A55C] shadow-[0_0_0_3px_rgba(200,165,92,0.15)]'
              : 'border-[rgba(245,240,232,0.08)]'
          }`} style={{ background: '#1A1A1F' }}>
            <Search className="w-4 h-4 text-[#9B9589] shrink-0" />
            <input
              type="text"
              placeholder="Search eBooks, authors, or ask Virtus AI..."
              className="flex-1 bg-transparent text-[13px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <span className="hidden sm:inline text-[11px] font-medium text-[#9B9589] font-mono tracking-wider">⌘K</span>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[280px] p-6" style={{ background: '#232328', borderLeft: '1px solid rgba(245,240,232,0.08)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-6">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#9B9589]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-[#C8A55C] bg-[rgba(200,165,92,0.12)]'
                      : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
                    <Sparkles className="w-4 h-4" />
                    Create eBook
                  </Link>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#C27070] hover:bg-[rgba(194,112,112,0.08)] transition-all">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-[136px] pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
