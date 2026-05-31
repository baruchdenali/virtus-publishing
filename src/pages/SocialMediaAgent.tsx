import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Calendar, Check, Play, Pause, RotateCcw, TrendingUp, Users, Eye, Heart, MessageCircle, Send, Clock, AlertTriangle, CheckCircle, Image, Type, Link2 } from 'lucide-react'

interface Campaign {
  id: number
  name: string
  channel: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed'
  content: string
  scheduledAt: string
  engagement: number
  reach: number
  conversions: number
  confidence: number
}

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

const initialCampaigns: Campaign[] = [
  { id: 1, name: 'New AI Feature Launch', channel: 'Twitter', status: 'running', content: 'Exciting news! Our AI Writing Assistant just got a major upgrade. Write smarter, publish faster with Virtus Publishing. #AIPublishing #VirtusPublishing', scheduledAt: '2026-06-01 10:00', engagement: 342, reach: 5600, conversions: 28, confidence: 96 },
  { id: 2, name: 'Author Spotlight: Elena Voss', channel: 'LinkedIn', status: 'scheduled', content: 'Meet Elena Voss, a Virtus author who published 5 bestsellers in 12 months using our platform. Read her story and learn how you can do the same.', scheduledAt: '2026-06-02 14:00', engagement: 0, reach: 0, conversions: 0, confidence: 92 },
  { id: 3, name: 'Weekend Writing Challenge', channel: 'Instagram', status: 'draft', content: 'Join our Weekend Writing Challenge! Use our AI assistant to write 1,000 words this weekend. Tag us with your progress! #WeekendWritingChallenge', scheduledAt: '', engagement: 0, reach: 0, conversions: 0, confidence: 88 },
  { id: 4, name: 'Enterprise Licensing Promo', channel: 'LinkedIn', status: 'paused', content: 'Universities and publishing houses: Scale your publishing with Virtus Enterprise. Custom pricing starts at $5,000/year. DM us for a demo.', scheduledAt: '2026-06-03 09:00', engagement: 156, reach: 3200, conversions: 12, confidence: 91 },
  { id: 5, name: 'Summer Sale Announcement', channel: 'Twitter', status: 'completed', content: 'Summer Sale! Get 30% off Virtus Professional for your first 3 months. Use code SUMMER30. Limited time offer! #SummerSale #eBookPublishing', scheduledAt: '2026-05-28 08:00', engagement: 891, reach: 12400, conversions: 67, confidence: 95 },
]

const socialAccounts = [
  { platform: 'Twitter', handle: '@VirtusPublishing', followers: 12500, growth: '+8%', status: 'connected', lastPost: '2h ago' },
  { platform: 'LinkedIn', handle: 'Virtus Publishing', followers: 8400, growth: '+12%', status: 'connected', lastPost: '5h ago' },
  { platform: 'Instagram', handle: '@virtus.publishing', followers: 6200, growth: '+15%', status: 'connected', lastPost: '1d ago' },
  { platform: 'Facebook', handle: 'Virtus Publishing', followers: 4300, growth: '+3%', status: 'needs_auth', lastPost: '3d ago' },
]

export default function SocialMediaAgent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newChannel, setNewChannel] = useState('Twitter')
  const [newContent, setNewContent] = useState('')
  const [newScheduled, setNewScheduled] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const runningCount = campaigns.filter(c => c.status === 'running').length
  const scheduledCount = campaigns.filter(c => c.status === 'scheduled').length
  const draftCount = campaigns.filter(c => c.status === 'draft').length
  const completedCount = campaigns.filter(c => c.status === 'completed').length
  const totalEngagement = campaigns.reduce((sum, c) => sum + c.engagement, 0)
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0)
  const avgConfidence = campaigns.filter(c => c.confidence > 0).length > 0
    ? Math.round(campaigns.filter(c => c.confidence > 0).reduce((sum, c) => sum + c.confidence, 0) / campaigns.filter(c => c.confidence > 0).length)
    : 0

  function toggleStatus(id: number) {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c
      const next: Record<string, Campaign['status']> = { draft: 'scheduled', scheduled: 'running', running: 'paused', paused: 'running', completed: 'completed' }
      return { ...c, status: next[c.status] || c.status }
    }))
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

  function createCampaign() {
    if (!newName.trim() || !newContent.trim()) return
    const newCampaign: Campaign = {
      id: Date.now(),
      name: newName,
      channel: newChannel,
      status: newScheduled ? 'scheduled' : 'draft',
      content: newContent,
      scheduledAt: newScheduled,
      engagement: 0,
      reach: 0,
      conversions: 0,
      confidence: Math.floor(Math.random() * 15) + 85,
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setNewName('')
    setNewContent('')
    setNewScheduled('')
    setShowCreate(false)
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]',
    scheduled: 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]',
    running: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
    paused: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
    completed: 'bg-[rgba(200,165,92,0.12)] text-[#C8A55C]',
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

      {/* Social Accounts */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C8A55C]" />Connected Accounts
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {socialAccounts.map((acc) => (
            <div key={acc.platform} className="glass-surface p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium">{acc.platform}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${acc.status === 'connected' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]'}`}>
                  {acc.status === 'connected' ? 'Live' : 'Auth Needed'}
                </span>
              </div>
              <p className="text-[12px] text-[#9B9589]">{acc.handle}</p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-[#9B9589]">
                <span>{acc.followers.toLocaleString()} followers</span>
                <span className="text-[#4ADE80]">{acc.growth}</span>
              </div>
              <p className="text-[10px] text-[#9B9589] mt-1">Last post: {acc.lastPost}</p>
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

          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="field text-[13px] h-24 resize-none w-full"
            placeholder="Write your post content here..."
            maxLength={channelConfig[newChannel]?.maxChars || 280}
          />
          <div className="text-[10px] text-[#9B9589] text-right">{newContent.length} / {channelConfig[newChannel]?.maxChars || 280}</div>

          <div>
            <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Schedule (optional — leave blank for draft)</label>
            <input type="datetime-local" value={newScheduled} onChange={e => setNewScheduled(e.target.value)} className="field text-[13px] w-full" />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-[13px] text-[#9B9589] hover:text-[#F5F0E8]">Cancel</button>
            <button onClick={createCampaign} disabled={!newName.trim() || !newContent.trim()} className="btn-gold text-[13px] disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />Create Campaign
            </button>
          </div>
        </motion.div>
      )}

      {/* Campaigns */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C8A55C]" />Campaigns
        </h2>
        <div className="space-y-2">
          {campaigns.map((camp, i) => (
            <motion.div key={camp.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${statusColors[camp.status]}`}>{camp.status}</span>
                    <span className="text-[11px] text-[#9B9589]">{camp.channel}</span>
                    {camp.confidence >= 95 && <span className="text-[10px] text-[#4ADE80] flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />95%+</span>}
                  </div>
                  <h3 className="text-[14px] font-semibold">{camp.name}</h3>
                  <p className="text-[12px] text-[#9B9589] truncate mt-0.5">{camp.content}</p>
                  {camp.scheduledAt && <p className="text-[10px] text-[#6B9BD1] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{camp.scheduledAt}</p>}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {camp.engagement > 0 && (
                    <div className="flex gap-3 text-[11px] text-[#9B9589]">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#C8A55C]" />{camp.engagement}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{camp.reach?.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#4ADE80]" />{camp.conversions}</span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleStatus(camp.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      camp.status === 'running' ? 'bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)]' : 'bg-[rgba(74,222,128,0.12)] hover:bg-[rgba(74,222,128,0.2)]'
                    }`}
                    title={camp.status === 'running' ? 'Pause' : 'Start'}
                  >
                    {camp.status === 'running' ? <Pause className="w-4 h-4 text-[#EF4444]" /> : <Play className="w-4 h-4 text-[#4ADE80]" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Agent Instructions */}
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
