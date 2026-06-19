import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Share2, Calendar, Play, Pause, TrendingUp, Users, Eye, Heart,
  Send, Clock, CheckCircle, Zap, Edit3, Check, X, Link2,
  Globe, Trash2, AlertTriangle, RefreshCw, Loader2
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const channelConfig: Record<string, { maxChars: number; supportsImage: boolean; supportsLink: boolean }> = {
  Twitter: { maxChars: 280, supportsImage: true, supportsLink: true },
  LinkedIn: { maxChars: 3000, supportsImage: true, supportsLink: true },
  Instagram: { maxChars: 2200, supportsImage: true, supportsLink: false },
  Facebook: { maxChars: 63206, supportsImage: true, supportsLink: true },
  Blog: { maxChars: 50000, supportsImage: true, supportsLink: true },
}

interface SocialAccount {
  id: number
  platform: string
  handle: string
  url: string
  followers: number
  growth: string
  status: 'connected' | 'needs_auth' | 'disconnected'
  lastPost: string
}

const initialAccounts: SocialAccount[] = [
  { id: 1, platform: 'Twitter', handle: '@VirtusPublishing', url: 'https://twitter.com/VirtusPublishing', followers: 12500, growth: '+8%', status: 'connected', lastPost: '2h ago' },
  { id: 2, platform: 'LinkedIn', handle: 'Virtus Publishing', url: 'https://linkedin.com/company/virtus-publishing', followers: 8400, growth: '+12%', status: 'connected', lastPost: '5h ago' },
  { id: 3, platform: 'Instagram', handle: '@virtus.publishing', url: 'https://instagram.com/virtus.publishing', followers: 6200, growth: '+15%', status: 'connected', lastPost: '1d ago' },
  { id: 4, platform: 'Facebook', handle: 'Virtus Publishing', url: 'https://facebook.com/VirtusPublishing', followers: 4300, growth: '+3%', status: 'needs_auth', lastPost: '3d ago' },
  { id: 5, platform: 'TikTok', handle: '@virtuspublishing', url: 'https://tiktok.com/@virtuspublishing', followers: 0, growth: '0%', status: 'disconnected', lastPost: 'Never' },
  { id: 6, platform: 'YouTube', handle: 'Virtus Publishing', url: 'https://youtube.com/@VirtusPublishing', followers: 0, growth: '0%', status: 'disconnected', lastPost: 'Never' },
]

export default function SocialMediaAgent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasAccess = user?.role === 'admin' || user?.role === 'operations'
  const utils = trpc.useUtils()

  // tRPC: campaigns from database
  const { data: dbCampaigns, isLoading } = trpc.campaign.list.useQuery(undefined, { enabled: hasAccess })
  const createMutation = trpc.campaign.create.useMutation({ onSuccess: () => utils.campaign.list.invalidate() })
  const updateStatusMutation = trpc.campaign.updateStatus.useMutation({ onSuccess: () => utils.campaign.list.invalidate() })
  const deleteMutation = trpc.campaign.delete.useMutation({ onSuccess: () => utils.campaign.list.invalidate() })

  const campaigns = dbCampaigns ?? []

  // Local state
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newChannel, setNewChannel] = useState('Twitter')
  const [newContent, setNewContent] = useState('')
  const [newScheduled, setNewScheduled] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [editingAccount, setEditingAccount] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ handle: '', url: '' })

  const runningCount = campaigns.filter((c: any) => c.status === 'running').length
  const scheduledCount = campaigns.filter((c: any) => c.status === 'scheduled').length
  const draftCount = campaigns.filter((c: any) => c.status === 'draft').length
  const totalEngagement = campaigns.reduce((sum: number, c: any) => sum + (c.engagement ?? 0), 0)
  const totalReach = campaigns.reduce((sum: number, c: any) => sum + (c.reach ?? 0), 0)
  const avgConfidence = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum: number, c: any) => sum + Number(c.confidenceScore ?? 0), 0) / campaigns.length)
    : 0

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Share2 className="w-16 h-16 text-[#C27070] mb-4" />
        <h2 className="text-[24px] font-semibold mb-2">Access Denied</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">You need admin or operations privileges to access the Social Media Agent.</p>
        <button onClick={() => navigate('/')} className="btn-gold text-[13px]">Back to Home</button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]',
    scheduled: 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]',
    running: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
    paused: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
    completed: 'bg-[rgba(200,165,92,0.12)] text-[#C8A55C]',
  }

  function handleToggleStatus(id: number, current: string) {
    const next: Record<string, string> = { draft: 'scheduled', scheduled: 'running', running: 'paused', paused: 'running', completed: 'completed' }
    updateStatusMutation.mutate({ id, status: next[current] as any })
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this campaign?')) deleteMutation.mutate({ id })
  }

  function handleCreateCampaign() {
    if (!newName.trim() || !newContent.trim()) return
    createMutation.mutate({
      name: newName,
      channel: newChannel,
      content: newContent,
      status: newScheduled ? 'scheduled' : 'draft',
      scheduledAt: newScheduled || undefined,
      confidenceScore: Math.floor(Math.random() * 15) + 85,
    }, {
      onSuccess: () => {
        setNewName('')
        setNewContent('')
        setNewScheduled('')
        setShowCreate(false)
      }
    })
  }

  function generateAIContent() {
    if (!aiPrompt.trim()) return
    const templates = [
      `Unlock your publishing potential with Virtus! ${aiPrompt}. Join thousands of authors who trust our AI-powered platform. #VirtusPublishing #eBooks`,
      `Big news from Virtus Publishing! ${aiPrompt}. Our community of 50,000+ authors is growing every day. Are you ready to publish?`,
      `${aiPrompt} — experience the future of publishing with Virtus. AI-assisted writing, professional formatting, and global distribution in one platform.`,
    ]
    setNewContent(templates[Math.floor(Math.random() * templates.length)])
    setAiMode(false)
  }

  function startEditingAccount(acc: SocialAccount) {
    setEditingAccount(acc.id)
    setEditForm({ handle: acc.handle, url: acc.url })
  }

  function saveAccountEdit(id: number) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, handle: editForm.handle, url: editForm.url } : a))
    setEditingAccount(null)
  }

  function connectAccount(id: number) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: 'connected' as const, growth: '+0%', lastPost: 'Just now' } : a))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-[#C8A55C]" />
            <h1 className="text-[28px] font-semibold">Social Media Agent</h1>
          </div>
          <p className="text-[13px] text-[#9B9589]">Curate and manage your online presence across all platforms.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-gold text-[13px] flex items-center gap-2">
          <Send className="w-4 h-4" />{showCreate ? 'Close' : 'New Campaign'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Running', value: runningCount, color: '#4ADE80' },
          { label: 'Scheduled', value: scheduledCount, color: '#6B9BD1' },
          { label: 'Drafts', value: draftCount, color: '#9B9589' },
          { label: 'Total Engagement', value: totalEngagement.toLocaleString(), color: '#C8A55C' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, color: '#D9BC7A' },
        ].map((stat) => (
          <div key={stat.label} className="glass-surface p-4 text-center">
            <div className="text-[22px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] text-[#9B9589]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Connected Social Accounts — EDITABLE */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C8A55C]" />Connected Accounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="glass-surface p-4 card-hover">
              {editingAccount === acc.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#C8A55C]">{acc.platform}</span>
                    <div className="flex gap-1">
                      <button onClick={() => saveAccountEdit(acc.id)} className="p-1 rounded bg-[rgba(74,222,128,0.12)] text-[#4ADE80]"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingAccount(null)} className="p-1 rounded bg-[rgba(239,68,68,0.12)] text-[#EF4444]"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Handle / Username</label>
                    <input value={editForm.handle} onChange={e => setEditForm(f => ({ ...f, handle: e.target.value }))} className="field text-[12px] w-full" placeholder="@username" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Profile URL</label>
                    <input value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} className="field text-[12px] w-full" placeholder="https://..." />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-medium">{acc.platform}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${acc.status === 'connected' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : acc.status === 'needs_auth' ? 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]' : 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]'}`}>
                        {acc.status === 'connected' ? 'Live' : acc.status === 'needs_auth' ? 'Auth Needed' : 'Disconnected'}
                      </span>
                      <button onClick={() => startEditingAccount(acc)} className="p-1 rounded hover:bg-[rgba(245,240,232,0.04)] text-[#9B9589] hover:text-[#C8A55C] transition-colors" title="Edit handle">
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#6B9BD1] hover:text-[#C8A55C] transition-colors flex items-center gap-1">
                    <Link2 className="w-3 h-3" />{acc.handle}
                  </a>
                  {acc.followers > 0 && (
                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#9B9589]">
                      <span>{acc.followers.toLocaleString()} followers</span>
                      <span className="text-[#4ADE80]">{acc.growth}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-[#9B9589] mt-1">Last post: {acc.lastPost}</p>
                  {acc.status !== 'connected' && (
                    <button onClick={() => connectAccount(acc.id)} className="mt-2 w-full text-[11px] py-1.5 rounded-lg bg-[rgba(200,165,92,0.1)] text-[#C8A55C] hover:bg-[rgba(200,165,92,0.2)] transition-colors flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" />{acc.status === 'needs_auth' ? 'Re-Authenticate' : 'Connect Account'}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Create Campaign */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-surface p-6 space-y-4">
          <h3 className="text-[16px] font-semibold">Create New Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Campaign Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="field text-[13px] w-full" placeholder="Summer Book Launch" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Channel</label>
              <select value={newChannel} onChange={e => setNewChannel(e.target.value)} className="field text-[13px] w-full">
                {Object.keys(channelConfig).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setAiMode(!aiMode)} className={`text-[11px] px-2 py-1 rounded flex items-center gap-1 ${aiMode ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589]'}`}>
              <Zap className="w-3 h-3" />AI Assist
            </button>
            {newChannel && (
              <span className="text-[10px] text-[#9B9589]">
                {channelConfig[newChannel].maxChars.toLocaleString()} chars max
                {channelConfig[newChannel].supportsImage && ' | Images OK'}
              </span>
            )}
          </div>
          {aiMode && (
            <div className="flex gap-2">
              <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="field text-[13px] flex-1" placeholder="Describe what you want to promote..." />
              <button onClick={generateAIContent} className="btn-gold text-[12px] px-3"><Zap className="w-3 h-3" />Generate</button>
            </div>
          )}
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="field text-[13px] h-24 resize-none w-full" placeholder="Write your post content here..." maxLength={channelConfig[newChannel]?.maxChars || 280} />
          <div className="text-[10px] text-[#9B9589] text-right">{newContent.length} / {channelConfig[newChannel]?.maxChars || 280}</div>
          <div>
            <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Schedule (optional — leave blank for draft)</label>
            <input type="datetime-local" value={newScheduled} onChange={e => setNewScheduled(e.target.value)} className="field text-[13px] w-full" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-[13px] text-[#9B9589] hover:text-[#F5F0E8]">Cancel</button>
            <button onClick={handleCreateCampaign} disabled={!newName.trim() || !newContent.trim() || createMutation.isPending} className="btn-gold text-[13px] disabled:opacity-50 flex items-center gap-2">
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Campaigns */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C8A55C]" />Campaigns
          {isLoading && <Loader2 className="w-4 h-4 text-[#C8A55C] animate-spin" />}
        </h2>
        {campaigns.length === 0 && !isLoading ? (
          <div className="glass-surface p-8 text-center">
            <p className="text-[13px] text-[#9B9589]">No campaigns yet. Click "New Campaign" to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((camp: any, i: number) => (
              <motion.div key={camp.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${statusColors[camp.status]}`}>{camp.status}</span>
                      <span className="text-[11px] text-[#9B9589]">{camp.channel}</span>
                      {Number(camp.confidenceScore) >= 95 && <span className="text-[10px] text-[#4ADE80] flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />95%+</span>}
                    </div>
                    <h3 className="text-[14px] font-semibold">{camp.name}</h3>
                    <p className="text-[12px] text-[#9B9589] truncate mt-0.5">{camp.content}</p>
                    {camp.scheduledAt && <p className="text-[10px] text-[#6B9BD1] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(camp.scheduledAt).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {(camp.engagement ?? 0) > 0 && (
                      <div className="flex gap-3 text-[11px] text-[#9B9589]">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#C8A55C]" />{camp.engagement}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(camp.reach ?? 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#4ADE80]" />{camp.conversions}</span>
                      </div>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => handleToggleStatus(camp.id, camp.status)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${camp.status === 'running' ? 'bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)]' : 'bg-[rgba(74,222,128,0.12)] hover:bg-[rgba(74,222,128,0.2)]'}`} title={camp.status === 'running' ? 'Pause' : 'Start'}>
                        {camp.status === 'running' ? <Pause className="w-4 h-4 text-[#EF4444]" /> : <Play className="w-4 h-4 text-[#4ADE80]" />}
                      </button>
                      <button onClick={() => handleDelete(camp.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] transition-all" title="Delete">
                        <Trash2 className="w-4 h-4 text-[#C27070]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Agent Protocol */}
      <section className="glass-surface p-5 border border-[rgba(200,165,92,0.1)]">
        <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#C8A55C]" />Agent Operating Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] text-[#9B9589]">
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Primary Responsibilities:</p>
            <ul className="space-y-1">
              <li>• Maintain curated presence across all connected social platforms</li>
              <li>• Create and schedule promotional content for new features, authors, and eBooks</li>
              <li>• Monitor engagement metrics and optimize posting times</li>
              <li>• Respond to community comments and messages within 2 hours</li>
              <li>• Coordinate with Marketing Agent on campaign launches</li>
            </ul>
          </div>
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Quality Standards:</p>
            <ul className="space-y-1">
              <li>• All campaigns must achieve 95%+ confidence score before scheduling</li>
              <li>• Content must align with Virtus brand voice (elite, professional, green)</li>
              <li>• Never post without admin approval for major announcements</li>
              <li>• Weekly reporting on reach, engagement, and conversion metrics</li>
              <li>• Maintain consistent posting schedule (min 3x/day on Twitter, 1x/day on LinkedIn)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
