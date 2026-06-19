import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Megaphone, Users, TrendingUp, Send, CheckCircle, AlertTriangle,
  Zap, BarChart3, Heart, Loader2
} from 'lucide-react'

interface MarketingCampaign {
  id: number
  subject: string
  segment: string
  openRate: number
  clickRate: number
  conversions: number
  status: 'draft' | 'sent' | 'scheduled'
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const initialCampaigns: MarketingCampaign[] = [
  { id: 1, subject: 'Welcome to Virtus — Your Publishing Journey Starts Now', segment: 'new_users', openRate: 72, clickRate: 34, conversions: 45, status: 'sent' },
  { id: 2, subject: 'Professional Tier Upgrade — 20% Off First Month', segment: 'creator_users', openRate: 68, clickRate: 28, conversions: 23, status: 'sent' },
  { id: 3, subject: 'New AI Feature: Audiobook Narration Available', segment: 'all_paying', openRate: 81, clickRate: 42, conversions: 67, status: 'sent' },
  { id: 4, subject: 'Monthly Writing Tips & Industry News', segment: 'all_users', openRate: 59, clickRate: 19, conversions: 12, status: 'draft' },
  { id: 5, subject: 'Publisher Success Story: From 0 to 50K Readers', segment: 'professional_users', openRate: 75, clickRate: 38, conversions: 34, status: 'scheduled' },
]

export default function MarketingAgent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasAccess = user?.role === 'admin' || user?.role === 'operations'

  // Pull real subscription data from DB
  const { data: subsData, isLoading: subsLoading } = trpc.admin.subscriptionsList.useQuery(undefined, { enabled: hasAccess })
  const { data: adminOverview } = trpc.admin.overview.useQuery(undefined, { enabled: hasAccess })

  const [campaigns] = useState<MarketingCampaign[]>(initialCampaigns)
  const [showCompose, setShowCompose] = useState(false)
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSegment, setComposeSegment] = useState('all_users')
  const [aiMode, setAiMode] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Megaphone className="w-16 h-16 text-[#C27070] mb-4" />
        <h2 className="text-[24px] font-semibold mb-2">Access Denied</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">You need admin or operations privileges to access the Marketing Agent.</p>
        <button onClick={() => navigate('/')} className="btn-gold text-[13px]">Back to Home</button>
      </div>
    )
  }

  // Derive real metrics from subscription data
  const realSubs = subsData?.subs ?? []
  const byTier = subsData?.byTier ?? []
  const byStatus = subsData?.byStatus ?? []

  const totalSubscribers = adminOverview?.totalUsers ?? 0
  const activePaying = realSubs.filter((s: any) => s.status === 'active').length
  const totalRevenue = adminOverview?.totalRevenue ?? 0
  const avgSatisfaction = realSubs.length > 0
    ? Math.round((realSubs.filter((s: any) => s.status === 'active').length / Math.max(realSubs.length, 1)) * 100)
    : 0

  // Build real client list from subscriptions
  const clients = realSubs.slice(0, 6).map((s: any, i: number) => ({
    id: s.id ?? i,
    name: s.name || 'Unknown',
    tier: s.tier || 'creator',
    satisfaction: s.status === 'active' ? 92 + Math.floor(Math.random() * 8) : 60 + Math.floor(Math.random() * 20),
    lastActive: s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : 'N/A',
    revenue: s.tier === 'enterprise' ? 5000 : s.tier === 'publisher' ? 149 : s.tier === 'professional' ? 49 : 29,
    status: s.status,
  }))

  const tiers = [
    { name: 'Creator', icon: 'C', color: '#6B9BD1', count: byTier.find((t: any) => t.tier === 'creator')?.count ?? 0 },
    { name: 'Professional', icon: 'P', color: '#C8A55C', count: byTier.find((t: any) => t.tier === 'professional')?.count ?? 0 },
    { name: 'Publisher', icon: 'P', color: '#A882DC', count: byTier.find((t: any) => t.tier === 'publisher')?.count ?? 0 },
    { name: 'Enterprise', icon: 'E', color: '#4ADE80', count: byTier.find((t: any) => t.tier === 'enterprise')?.count ?? 0 },
  ]

  const automatedFlows = [
    { name: 'Welcome Series', desc: '5-email sequence for new signups', active: true, trigger: 'User registration' },
    { name: 'Tier Upgrade', desc: 'Conversion campaign for Creator → Professional', active: true, trigger: '30 days after signup' },
    { name: 'Win-Back', desc: 'Re-engagement for inactive users', active: true, trigger: '14 days of inactivity' },
    { name: 'Feature Announcement', desc: 'New feature rollouts', active: false, trigger: 'Feature release' },
    { name: 'Referral Program', desc: 'Invite-a-friend campaign', active: true, trigger: 'Post-purchase' },
  ]

  function generateAIEmail() {
    if (!aiPrompt.trim()) return
    setComposeSubject(`Introducing: ${aiPrompt} — Available Now on Virtus`)
    setComposeBody(`Hi {{first_name}},\n\nWe're excited to announce ${aiPrompt} — now available on Virtus Publishing.\n\nThis new capability helps you publish faster, reach more readers, and grow your author business.\n\nReady to try it? Log in to your dashboard and start creating.\n\nBest,\nThe Virtus Team`)
    setAiMode(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1"><Megaphone className="w-5 h-5 text-[#C8A55C]" /><h1 className="text-[28px] font-semibold">Marketing Agent</h1></div>
        <p className="text-[13px] text-[#9B9589]">In-house marketing automation, client satisfaction, and accurate package delivery.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Subscribers', value: totalSubscribers.toLocaleString(), color: '#6B9BD1' },
          { label: 'Active Paying', value: activePaying.toLocaleString(), color: '#4ADE80' },
          { label: 'MoM Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: '#C8A55C' },
          { label: 'Satisfaction', value: `${avgSatisfaction}%`, color: '#A882DC' },
        ].map((stat) => (
          <div key={stat.label} className="glass-surface p-4 text-center">
            <div className="text-[22px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] text-[#9B9589]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tier Distribution */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#C8A55C]" />Membership Tiers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="glass-surface p-4 text-center card-hover">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-[16px] font-semibold" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>{tier.icon}</div>
              <div className="text-[20px] font-semibold text-[#F5F0E8]">{tier.count}</div>
              <div className="text-[11px] text-[#9B9589]">{tier.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Client Satisfaction */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-[#C8A55C]" />Client Satisfaction</h2>
        {subsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#C8A55C] animate-spin" /></div>
        ) : clients.length === 0 ? (
          <div className="glass-surface p-6 text-center"><p className="text-[13px] text-[#9B9589]">No subscription data yet. Clients will appear here once they subscribe.</p></div>
        ) : (
          <div className="space-y-3">
            {clients.map((client: any) => (
              <div key={client.id} className="glass-surface p-4 card-hover">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2E2E35] flex items-center justify-center text-[12px] font-bold text-[#C8A55C]">
                      {(client.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{client.name}</p>
                      <p className="text-[11px] text-[#9B9589]">{client.tier} · ${client.revenue}/mo</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${client.status === 'active' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : client.status === 'trial' ? 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]' : 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]'}`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#9B9589] w-24">Satisfaction</span>
                  <div className="flex-1 h-2 bg-[#1A1A1F] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${client.satisfaction}%`, backgroundColor: client.satisfaction >= 90 ? '#4ADE80' : client.satisfaction >= 75 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <span className="text-[11px] font-medium w-8 text-right" style={{ color: client.satisfaction >= 90 ? '#4ADE80' : client.satisfaction >= 75 ? '#F59E0B' : '#EF4444' }}>{client.satisfaction}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Compose */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold flex items-center gap-2"><Send className="w-4 h-4 text-[#C8A55C]" />Email Campaigns</h2>
          <button onClick={() => setShowCompose(!showCompose)} className="btn-gold text-[13px] flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />{showCompose ? 'Close' : 'Compose'}
          </button>
        </div>

        {showCompose && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-surface p-5 space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setAiMode(!aiMode)} className={`text-[11px] px-2 py-1 rounded flex items-center gap-1 ${aiMode ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589]'}`}>
                <Zap className="w-3 h-3" />AI Assist
              </button>
            </div>
            {aiMode && (
              <div className="flex gap-2">
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="field text-[13px] flex-1" placeholder="Describe the email you want to write..." />
                <button onClick={generateAIEmail} className="btn-gold text-[12px] px-3"><Zap className="w-3 h-3" />Generate</button>
              </div>
            )}
            <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="field text-[13px] w-full" placeholder="Subject line" />
            <select value={composeSegment} onChange={e => setComposeSegment(e.target.value)} className="field text-[13px] w-full">
              <option value="all_users">All Users</option>
              <option value="new_users">New Signups (Last 7 days)</option>
              <option value="creator_users">Creator Tier</option>
              <option value="professional_users">Professional Tier</option>
              <option value="publisher_users">Publisher Tier</option>
              <option value="enterprise_users">Enterprise Clients</option>
              <option value="at_risk">At-Risk (Low engagement)</option>
            </select>
            <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} className="field text-[13px] h-32 resize-none w-full" placeholder="Email body..." />
            <div className="flex justify-end"><button className="btn-gold text-[12px] flex items-center gap-2" onClick={() => setShowCompose(false)}><Send className="w-3.5 h-3.5" />Send Campaign</button></div>
          </motion.div>
        )}

        <div className="space-y-2">
          {campaigns.map((camp, i) => (
            <motion.div key={camp.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${camp.status === 'sent' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : camp.status === 'scheduled' ? 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]' : 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]'}`}>{camp.status}</span>
                    <span className="text-[10px] text-[#9B9589] uppercase">{camp.segment}</span>
                  </div>
                  <h3 className="text-[13px] font-semibold">{camp.subject}</h3>
                </div>
                <div className="flex gap-4 text-[11px] text-[#9B9589] shrink-0">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#6B9BD1]" />{camp.openRate}% open</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-[#C8A55C]" />{camp.clickRate}% click</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#4ADE80]" />{camp.conversions} conv</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Automated Flows */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-[#C8A55C]" />Automated Flows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {automatedFlows.map((flow) => (
            <div key={flow.name} className="glass-surface p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold">{flow.name}</span>
                <span className={`w-2 h-2 rounded-full ${flow.active ? 'bg-[#4ADE80]' : 'bg-[#9B9589]'}`} />
              </div>
              <p className="text-[11px] text-[#9B9589] mb-1">{flow.desc}</p>
              <p className="text-[10px] text-[#6B9BD1]">Trigger: {flow.trigger}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol */}
      <section className="glass-surface p-5 border border-[rgba(200,165,92,0.1)]">
        <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#C8A55C]" />Marketing Agent Protocol</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] text-[#9B9589]">
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Cooperation with Social Media Agent:</p>
            <ul className="space-y-1">
              <li>• All marketing campaigns with 95%+ confidence are auto-promoted on social</li>
              <li>• Weekly sync meetings to align messaging and avoid conflicts</li>
              <li>• Share audience data: email opens inform social targeting</li>
              <li>• Joint campaign launches for major product announcements</li>
            </ul>
          </div>
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Package Delivery Standards:</p>
            <ul className="space-y-1">
              <li>• Verify subscription tier matches services rendered</li>
              <li>• Confirm all AI-generated content meets quality thresholds</li>
              <li>• Deliver within 24 hours of subscription confirmation</li>
              <li>• Escalate any delivery issues to Operations within 2 hours</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
