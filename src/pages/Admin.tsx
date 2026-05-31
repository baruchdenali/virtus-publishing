import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Users, BookOpen, ShoppingCart, DollarSign, Star, MessageSquare,
  TrendingUp, TrendingDown, Activity, ChevronLeft,
  ChevronRight, Shield, BarChart3, Tag, Eye, Newspaper, Mic, Download, FileText,
  Share2, Megaphone, Target, Settings
} from 'lucide-react'

const COLORS = ['#C8A55C', '#7AAE7A', '#6B9BD1', '#C27070', '#9B9589', '#D9BC7A']

function EbookDownloadButton({ bookId, bookTitle }: { bookId: number; bookTitle: string }) {
  const [downloading, setDownloading] = useState(false);
  const { data } = trpc.ebook.download.useQuery({ id: bookId }, { enabled: false });
  const utils = trpc.useUtils();

  async function handleDownload() {
    setDownloading(true);
    try {
      const result = await utils.ebook.download.fetch({ id: bookId });
      if (result) {
        const blob = new Blob([`# ${result.title}\n\n**Author:** ${result.author}\n**Category:** ${result.category}\n\n---\n\n${result.content || 'No content available.'}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert('Download failed. Make sure you are logged in as admin.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-8 h-8 rounded-lg bg-[rgba(200,165,92,0.1)] flex items-center justify-center hover:bg-[rgba(200,165,92,0.2)] transition-all disabled:opacity-50"
      title={`Download ${bookTitle}`}
    >
      <Download className="w-3.5 h-3.5 text-[#C8A55C]" />
    </button>
  );
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
}

export default function Admin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [days, setDays] = useState(30)
  const [userPage, setUserPage] = useState(1)

  const { data: overview } = trpc.admin.overview.useQuery(undefined, { enabled: isAdmin })
  const { data: revenueData } = trpc.admin.revenueByDay.useQuery({ days }, { enabled: isAdmin })
  const { data: userGrowth } = trpc.admin.userGrowth.useQuery({ days }, { enabled: isAdmin })
  const { data: ebookActivity } = trpc.admin.ebookActivity.useQuery({ days }, { enabled: isAdmin })
  const { data: topBooks } = trpc.admin.topBooks.useQuery({ limit: 10 }, { enabled: isAdmin })
  const { data: usersData } = trpc.admin.usersList.useQuery({ page: userPage, limit: 20 }, { enabled: isAdmin })
  const { data: categoryBreakdown } = trpc.admin.categoryBreakdown.useQuery(undefined, { enabled: isAdmin })

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="w-16 h-16 text-[#C27070] mb-4" />
        <h2 className="text-[24px] font-semibold mb-2">Access Denied</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">You need admin privileges to access this page.</p>
        <button onClick={() => navigate('/')} className="btn-gold text-[13px]">Back to Home</button>
      </div>
    )
  }

  const stats = useMemo(() => [
    { label: 'Total Users', value: overview?.totalUsers ?? 0, icon: Users, change: `+${overview?.newUsers30d ?? 0} this month`, positive: true },
    { label: 'Total eBooks', value: overview?.totalEbooks ?? 0, icon: BookOpen, change: `${overview?.publishedEbooks ?? 0} published`, positive: true },
    { label: 'Total Sales', value: overview?.totalPurchases ?? 0, icon: ShoppingCart, change: `${days}d period`, positive: true },
    { label: 'Total Revenue', value: `$${(overview?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, change: `$${(overview?.revenue30d ?? 0).toFixed(2)} this month`, positive: true },
    { label: 'Reviews', value: overview?.totalReviews ?? 0, icon: Star, change: 'All time', positive: true },
    { label: 'AI Interactions', value: overview?.aiMessagesCount ?? 0, icon: MessageSquare, change: 'All time', positive: true },
  ], [overview, days])

  const statusData = categoryBreakdown?.byStatus.map((s) => ({
    name: (s.status || 'unknown').replace('_', ' '),
    value: s.count,
  })) ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#C8A55C]" />
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Admin Panel</span>
          </div>
          <h1 className="text-[32px] font-semibold tracking-[-0.01em]">System Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#9B9589]">Period:</span>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                days === d ? 'bg-[#C8A55C] text-[#1A1A1F]' : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="glass-surface p-5"
          >
            <stat.icon className="w-5 h-5 text-[#C8A55C] mb-3" />
            <div className="text-[24px] font-semibold text-[#F5F0E8] leading-tight">{stat.value}</div>
            <div className="text-[11px] font-medium text-[#9B9589] mt-1">{stat.label}</div>
            <div className={`text-[11px] font-medium mt-1 flex items-center gap-0.5 ${stat.positive ? 'text-[#7AAE7A]' : 'text-[#C27070]'}`}>
              {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Management Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Blog Editor', desc: 'Write & publish blog posts', icon: Newspaper, path: '/admin/blog', color: '#C8A55C' },
          { label: 'Podcast Manager', desc: 'Add & manage episodes', icon: Mic, path: '/admin/podcast', color: '#7AAE7A' },
          { label: 'Create eBook', desc: 'Create new eBook with AI', icon: FileText, path: '/create', color: '#6B9BD1' },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            onClick={() => navigate(item.path)}
            className="glass-surface p-5 text-left card-hover group"
          >
            <item.icon className="w-6 h-6 mb-3" style={{ color: item.color }} />
            <div className="text-[15px] font-semibold">{item.label}</div>
            <div className="text-[12px] text-[#9B9589] mt-0.5">{item.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Team & Agent Dashboards */}
      <div>
        <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#9B9589] mb-4">Team & Agent Dashboards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Operations Command', desc: 'Supervise teams & agents', icon: Settings, path: '/admin/operations', color: '#C8A55C', badge: 'Ops' },
            { label: 'Sales Dashboard', desc: 'Pipeline & lead management', icon: Target, path: '/admin/sales', color: '#6B9BD1', badge: 'Sales' },
            { label: 'Social Media Agent', desc: 'Campaigns & social accounts', icon: Share2, path: '/admin/social-agent', color: '#7AAE7A', badge: 'Agent' },
            { label: 'Marketing Agent', desc: 'Client satisfaction & emails', icon: Megaphone, path: '/admin/marketing-agent', color: '#A882DC', badge: 'Agent' },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              onClick={() => navigate(item.path)}
              className="glass-surface p-5 text-left card-hover group relative"
            >
              <span className="absolute top-3 right-3 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(245,240,232,0.06)] text-[#9B9589]">{item.badge}</span>
              <item.icon className="w-6 h-6 mb-3" style={{ color: item.color }} />
              <div className="text-[15px] font-semibold">{item.label}</div>
              <div className="text-[12px] text-[#9B9589] mt-0.5">{item.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-surface p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-semibold">Revenue</h3>
              <p className="text-[12px] text-[#9B9589] mt-0.5">Daily sales over {days} days</p>
            </div>
            <DollarSign className="w-5 h-5 text-[#C8A55C]" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData ?? []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A55C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8A55C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#9B9589', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#9B9589', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#232328', border: '1px solid rgba(245,240,232,0.08)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9B9589' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C8A55C" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-surface p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-semibold">User Growth</h3>
              <p className="text-[12px] text-[#9B9589] mt-0.5">New signups over {days} days</p>
            </div>
            <Users className="w-5 h-5 text-[#7AAE7A]" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowth ?? []}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7AAE7A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7AAE7A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#9B9589', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#9B9589', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#232328', border: '1px solid rgba(245,240,232,0.08)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9B9589' }}
                formatter={(value: number, name: string) => [value, name === 'daily' ? 'New Users' : 'Total Users']}
              />
              <Area type="monotone" dataKey="daily" stroke="#7AAE7A" strokeWidth={2} fill="url(#userGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* eBook Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-surface p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-semibold">eBook Activity</h3>
              <p className="text-[12px] text-[#9B9589] mt-0.5">Created vs Published over {days} days</p>
            </div>
            <BookOpen className="w-5 h-5 text-[#6B9BD1]" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ebookActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#9B9589', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#9B9589', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#232328', border: '1px solid rgba(245,240,232,0.08)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9B9589' }}
              />
              <Bar dataKey="created" fill="#6B9BD1" radius={[4, 4, 0, 0]} name="Created" />
              <Bar dataKey="published" fill="#C8A55C" radius={[4, 4, 0, 0]} name="Published" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="glass-surface p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-semibold">eBook Status</h3>
              <p className="text-[12px] text-[#9B9589] mt-0.5">Distribution by status</p>
            </div>
            <Tag className="w-5 h-5 text-[#C8A55C]" />
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#232328', border: '1px solid rgba(245,240,232,0.08)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-[11px] text-[#9B9589]">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Books Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-surface overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgba(245,240,232,0.06)]">
          <div>
            <h3 className="text-[16px] font-semibold">Top Performing eBooks</h3>
            <p className="text-[12px] text-[#9B9589] mt-0.5">By sales and revenue</p>
          </div>
          <Eye className="w-5 h-5 text-[#C8A55C]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(245,240,232,0.06)]">
                <th className="text-left px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">eBook</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Price</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Sales</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Revenue</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Rating</th>
                <th className="text-right px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Download</th>
              </tr>
            </thead>
            <tbody>
              {topBooks?.map((book, i) => (
                <tr key={book.id} className="border-b border-[rgba(245,240,232,0.04)] hover:bg-[rgba(245,240,232,0.02)] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#9B9589] w-5">#{i + 1}</span>
                      <div>
                        <div className="font-medium text-[#F5F0E8]">{book.title}</div>
                        <div className="text-[11px] text-[#9B9589]">{book.authorName || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[rgba(200,165,92,0.08)] text-[#C8A55C] capitalize">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${
                      book.status === 'published' ? 'text-[#7AAE7A]' :
                      book.status === 'in_progress' ? 'text-[#6B9BD1]' :
                      book.status === 'draft' ? 'text-[#9B9589]' : 'text-[#C27070]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        book.status === 'published' ? 'bg-[#7AAE7A]' :
                        book.status === 'in_progress' ? 'bg-[#6B9BD1]' :
                        book.status === 'draft' ? 'bg-[#9B9589]' : 'bg-[#C27070]'
                      }`} />
                      {book.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#C8A55C]">
                    {book.isFree ? 'Free' : `$${book.price}`}
                  </td>
                  <td className="px-4 py-3 text-right">{book.sales}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#7AAE7A]">${(book.revenue ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 text-[#C8A55C] fill-[#C8A55C]" />
                      <span>{(book.avgRating ?? 0).toFixed(1)}</span>
                      <span className="text-[11px] text-[#9B9589]">({book.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <EbookDownloadButton bookId={book.id} bookTitle={book.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-surface overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgba(245,240,232,0.06)]">
          <div>
            <h3 className="text-[16px] font-semibold">Registered Users</h3>
            <p className="text-[12px] text-[#9B9589] mt-0.5">{usersData?.total ?? 0} total users</p>
          </div>
          <Users className="w-5 h-5 text-[#7AAE7A]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(245,240,232,0.06)]">
                <th className="text-left px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Role</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">eBooks</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Purchases</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Joined</th>
                <th className="text-left px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.items.map((u) => (
                <tr key={u.id} className="border-b border-[rgba(245,240,232,0.04)] hover:bg-[rgba(245,240,232,0.02)] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2E2E35] flex items-center justify-center text-[12px] font-semibold text-[#F5F0E8]">
                        {(u.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[#F5F0E8]">{u.name || 'Anonymous'}</div>
                        <div className="text-[11px] text-[#9B9589]">{u.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      u.role === 'admin'
                        ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]'
                        : 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{u.ebookCount}</td>
                  <td className="px-4 py-3 text-right">{u.purchaseCount}</td>
                  <td className="px-4 py-3 text-[#9B9589]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-3 text-[#9B9589]">
                    {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {usersData && usersData.total > 20 && (
          <div className="flex items-center justify-between p-4 border-t border-[rgba(245,240,232,0.06)]">
            <span className="text-[12px] text-[#9B9589]">
              Page {usersData.page} of {Math.ceil(usersData.total / usersData.limit)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                disabled={userPage <= 1}
                className="p-2 rounded-lg text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setUserPage((p) => p + 1)}
                disabled={!usersData || userPage >= Math.ceil(usersData.total / usersData.limit)}
                className="p-2 rounded-lg text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Insights Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-surface p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#C8A55C]" />
          <h3 className="text-[14px] font-semibold">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
          <div className="p-3 rounded-lg bg-[rgba(245,240,232,0.03)]">
            <div className="text-[#9B9589] mb-1">Publish Rate</div>
            <div className="text-[16px] font-semibold text-[#F5F0E8]">
              {overview && overview.totalEbooks > 0
                ? `${((overview.publishedEbooks / overview.totalEbooks) * 100).toFixed(1)}%`
                : '0%'}
            </div>
            <div className="text-[11px] text-[#9B9589] mt-0.5">of eBooks are published</div>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(245,240,232,0.03)]">
            <div className="text-[#9B9589] mb-1">Avg Revenue / Sale</div>
            <div className="text-[16px] font-semibold text-[#C8A55C]">
              {overview && overview.totalPurchases > 0
                ? `$${(overview.totalRevenue / overview.totalPurchases).toFixed(2)}`
                : '$0.00'}
            </div>
            <div className="text-[11px] text-[#9B9589] mt-0.5">per completed purchase</div>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(245,240,232,0.03)]">
            <div className="text-[#9B9589] mb-1">New User Velocity</div>
            <div className="text-[16px] font-semibold text-[#7AAE7A]">
              {overview ? (overview.newUsers30d / 30).toFixed(1) : '0.0'}
            </div>
            <div className="text-[11px] text-[#9B9589] mt-0.5">users per day (30d avg)</div>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(245,240,232,0.03)]">
            <div className="text-[#9B9589] mb-1">AI Engagement</div>
            <div className="text-[16px] font-semibold text-[#6B9BD1]">
              {overview?.aiMessagesCount ?? 0}
            </div>
            <div className="text-[11px] text-[#9B9589] mt-0.5">total AI interactions</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
