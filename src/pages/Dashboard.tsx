import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import {
  BookOpen, TrendingUp, Download, DollarSign, Plus, FileText,
  Sparkles, Clock, Globe, ChevronRight, BarChart3, Star, Lock
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

const statusColors: Record<string, { dot: string; bg: string; text: string }> = {
  draft: { dot: 'bg-[#9B9589]', bg: 'bg-[rgba(155,149,137,0.12)]', text: 'text-[#9B9589]' },
  in_progress: { dot: 'bg-[#6B9BD1]', bg: 'bg-[rgba(107,155,209,0.12)]', text: 'text-[#6B9BD1]' },
  published: { dot: 'bg-[#7AAE7A]', bg: 'bg-[rgba(122,174,122,0.12)]', text: 'text-[#7AAE7A]' },
  archived: { dot: 'bg-[#C27070]', bg: 'bg-[rgba(194,112,112,0.12)]', text: 'text-[#C27070]' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { hasActiveSubscription } = useSubscription()
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'in_progress' | 'published'>('all')

  const { data: stats } = trpc.user.stats.useQuery(undefined, { enabled: isAuthenticated })
  const { data: ebooksData, isLoading } = trpc.ebook.list.useQuery(
    {
      status: activeTab === 'all' ? undefined : activeTab,
      page: 1,
      limit: 20,
    },
    { enabled: isAuthenticated }
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#9B9589]">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { key: 'all' as const, label: 'All Projects' },
    { key: 'draft' as const, label: 'Drafts' },
    { key: 'in_progress' as const, label: 'In Progress' },
    { key: 'published' as const, label: 'Published' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.01em]">Dashboard</h1>
          <p className="text-[14px] text-[#9B9589] mt-1">Manage your eBooks and track performance</p>
        </div>
        {hasActiveSubscription ? (
          <Link to="/create" className="inline-flex items-center gap-2 btn-gold text-[13px] self-start">
            <Plus className="w-4 h-4" />
            Create New eBook
          </Link>
        ) : (
          <Link to="/pricing" className="inline-flex items-center gap-2 btn-gold text-[13px] self-start">
            <Lock className="w-4 h-4" />
            Subscribe to Publish
          </Link>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total eBooks', value: stats?.totalBooks ?? 0, icon: BookOpen, trend: '+2 this month' },
          { label: 'Published', value: stats?.publishedBooks ?? 0, icon: Globe },
          { label: 'Downloads', value: stats?.totalPurchases ?? 0, icon: Download },
          { label: 'Revenue', value: `$${(stats?.revenue ?? 0).toFixed(2)}`, icon: DollarSign },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="glass-surface p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-[#C8A55C]" />
              {stat.trend && (
                <span className="text-[11px] font-medium text-[#7AAE7A] bg-[rgba(122,174,122,0.12)] px-1.5 py-0.5 rounded">
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="text-[28px] font-semibold text-[#F5F0E8] leading-tight">{stat.value}</div>
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9589] mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#C8A55C] text-[#1A1A1F] font-semibold'
                : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-surface p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-24 bg-[#2E2E35] rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#2E2E35] rounded w-3/4" />
                  <div className="h-3 bg-[#2E2E35] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : ebooksData?.items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface p-12 text-center"
        >
          <FileText className="w-12 h-12 text-[#9B9589] mx-auto mb-4" />
          <h3 className="text-[18px] font-semibold mb-2">No eBooks yet</h3>
          <p className="text-[14px] text-[#9B9589] mb-6">Start your publishing journey by creating your first eBook.</p>
          {hasActiveSubscription ? (
            <Link to="/create" className="inline-flex items-center gap-2 btn-gold text-[13px]">
              <Sparkles className="w-4 h-4" />
              Create eBook
            </Link>
          ) : (
            <Link to="/pricing" className="inline-flex items-center gap-2 btn-gold text-[13px]">
              <Lock className="w-4 h-4" />
              Subscribe to Publish
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ebooksData?.items.map((book, i) => (
            <motion.div
              key={book.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Link to={`/editor/${book.id}`} className="glass-surface p-5 card-hover flex gap-4 group block">
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#2E2E35] shrink-0">
                  <img
                    src={book.coverImageUrl || `/covers/cover-${(book.id % 6) + 1}.jpg`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-[#F5F0E8] truncate group-hover:text-[#C8A55C] transition-colors">
                      {book.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#9B9589] shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[13px] text-[#9B9589] mt-0.5">{book.authorName || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[book.status || 'draft']?.bg || ''} ${statusColors[book.status || 'draft']?.text || ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[book.status || 'draft']?.dot || ''}`} />
                      {(book.status || 'draft').replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#9B9589] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.updatedAt ? new Date(book.updatedAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Stats Sidebar (bottom on mobile) */}
      {stats && stats.totalBooks > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[rgba(245,240,232,0.06)]">
          <div className="glass-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#C8A55C]" />
              <span className="text-[13px] font-medium">Writing Progress</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-semibold">{stats.inProgressBooks}</span>
              <span className="text-[12px] text-[#9B9589]">in progress</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#1A1A1F] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C8A55C] to-[#D9BC7A]"
                style={{ width: `${stats.totalBooks > 0 ? (stats.inProgressBooks / stats.totalBooks) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="glass-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#C8A55C]" />
              <span className="text-[13px] font-medium">Reviews</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-semibold">{stats.totalReviews}</span>
              <span className="text-[12px] text-[#9B9589]">total reviews</span>
            </div>
          </div>

          <div className="glass-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#C8A55C]" />
              <span className="text-[13px] font-medium">Performance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-semibold text-[#7AAE7A]">${(stats.revenue ?? 0).toFixed(2)}</span>
              <span className="text-[12px] text-[#9B9589]">lifetime revenue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
