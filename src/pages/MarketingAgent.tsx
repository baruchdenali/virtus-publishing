import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Mail, Zap, Users, ShoppingCart, Star, Send, BarChart3, CheckCircle, AlertTriangle, Megaphone, Heart, ArrowRight, Package, CreditCard } from 'lucide-react'

interface Client {
  id: number
  name: string
  email: string
  tier: string
  status: string
  satisfaction: number
  lastActive: string
  campaignsRun: number
  ebooksPublished: number
  revenue: number
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const initialClients: Client[] = [
  { id: 1, name: 'Elena Voss', email: 'elena.voss@email.com', tier: 'Professional', status: 'active', satisfaction: 98, lastActive: '2h ago', campaignsRun: 12, ebooksPublished: 5, revenue: 2847 },
  { id: 2, name: 'Marcus Chen', email: 'marcus.chen@email.com', tier: 'Publisher', status: 'active', satisfaction: 95, lastActive: '5h ago', campaignsRun: 24, ebooksPublished: 11, revenue: 5234 },
  { id: 3, name: 'Dr. Anya Sharma', email: 'anya.sharma@email.com', tier: 'Professional', status: 'active', satisfaction: 92, lastActive: '1d ago', campaignsRun: 8, ebooksPublished: 3, revenue: 1892 },
  { id: 4, name: 'Isabella King', email: 'isabella.king@email.com', tier: 'Creator', status: 'at_risk', satisfaction: 72, lastActive: '12d ago', campaignsRun: 2, ebooksPublished: 1, revenue: 456 },
  { id: 5, name: 'James Morrison', email: 'james.m@email.com', tier: 'Publisher', status: 'active', satisfaction: 97, lastActive: '3h ago', campaignsRun: 18, ebooksPublished: 8, revenue: 4156 },
  { id: 6, name: 'Ava Chen', email: 'ava.chen@email.com', tier: 'Professional', status: 'trial', satisfaction: 88, lastActive: '1d ago', campaignsRun: 1, ebooksPublished: 0, revenue: 0 },
]

const marketingActions = [
  { name: 'Welcome Email Sequence', type: 'email', status: 'active', trigger: 'New signup', sent: 342, opened: 289, clicked: 156 },
  { name: 'Tier Upgrade Nudge', type: 'email', status: 'active', trigger: '30 days on Creator', sent: 89, opened: 67, clicked: 34 },
  { name: 'Win-Back Campaign', type: 'email', status: 'active', trigger: '14 days inactive', sent: 45, opened: 23, clicked: 8 },
  { name: 'New Feature Announcement', type: 'push', status: 'scheduled', trigger: 'Feature release', sent: 0, opened: 0, clicked: 0 },
  { name: 'Referral Program Promo', type: 'social', status: 'active', trigger: 'Quarterly', sent: 1200, opened: 890, clicked: 412 },
]

export default function MarketingAgent() {
  const [clients] = useState<Client[]>(initialClients)
  const [showCompose, setShowCompose] = useState(false)
  const [composeEmail, setComposeEmail] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('all')

  const activeClients = clients.filter(c => c.status === 'active').length
  const atRiskClients = clients.filter(c => c.status === 'at_risk').length
  const trialClients = clients.filter(c => c.status === 'trial').length
  const avgSatisfaction = Math.round(clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length)
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)

  function generateEmail() {
    if (!composeSubject.trim()) return
    const templates: Record<string, string> = {
      all: `Dear valued author,\n\nWe hope you're enjoying your publishing journey with Virtus! We wanted to share some exciting updates and personalized recommendations to help you get the most out of your subscription.\n\nBest regards,\nThe Virtus Marketing Team`,
      at_risk: `Hi there,\n\nWe noticed you haven't been active lately, and we miss you! Your stories matter, and we're here to help you get back on track. Here are some quick wins to reignite your creative spark...\n\nLet us know how we can help.\nVirtus Team`,
      trial: `Welcome to Virtus Publishing!\n\nYou're on a 14-day trial of our Professional plan. Here's everything you need to know to make the most of your experience and publish your first eBook today.\n\nLet's create something amazing together!\nVirtus Onboarding`,
    }
    setComposeBody(templates[selectedSegment] || templates.all)
  }

  function sendCampaign() {
    alert(`Campaign "${composeSubject}" queued for ${selectedSegment === 'all' ? 'all clients' : selectedSegment + ' clients'}. Estimated delivery: 2-3 minutes.`)
    setShowCompose(false)
    setComposeEmail('')
    setComposeSubject('')
    setComposeBody('')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-[#C8A55C]" />
            <h1 className="text-[28px] font-semibold">Marketing Agent</h1>
          </div>
          <p className="text-[13px] text-[#9B9589]">In-house marketing automation. Ensure client satisfaction and accurate package delivery.</p>
        </div>
        <button onClick={() => setShowCompose(!showCompose)} className="btn-gold text-[13px] flex items-center gap-2">
          <Mail className="w-4 h-4" />{showCompose ? 'Close' : 'Compose Campaign'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Active Clients', value: activeClients, color: '#4ADE80' },
          { label: 'At Risk', value: atRiskClients, color: '#EF4444' },
          { label: 'In Trial', value: trialClients, color: '#6B9BD1' },
          { label: 'Avg Satisfaction', value: `${avgSatisfaction}%`, color: '#C8A55C' },
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, color: '#D9BC7A' },
        ].map((stat) => (
          <div key={stat.label} className="glass-surface p-4 text-center">
            <div className="text-[22px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] text-[#9B9589]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Compose Campaign */}
      {showCompose && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-surface p-6 space-y-4">
          <h3 className="text-[16px] font-semibold">Compose Marketing Campaign</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Target Segment</label>
              <select value={selectedSegment} onChange={e => setSelectedSegment(e.target.value)} className="field text-[13px] w-full">
                <option value="all">All Clients</option>
                <option value="active">Active Subscribers</option>
                <option value="at_risk">At-Risk Clients</option>
                <option value="trial">Trial Users</option>
                <option value="creator">Creator Tier</option>
                <option value="professional">Professional Tier</option>
                <option value="publisher">Publisher Tier</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#9B9589] uppercase tracking-wider mb-1 block">Subject Line</label>
              <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="field text-[13px] w-full" placeholder="Exciting updates from Virtus Publishing" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={generateEmail} className="text-[11px] px-2 py-1 rounded flex items-center gap-1 bg-[rgba(200,165,92,0.15)] text-[#C8A55C]">
              <Zap className="w-3 h-3" />AI Generate Body
            </button>
          </div>

          <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} className="field text-[13px] h-32 resize-none w-full font-mono" placeholder="Email body..." />

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 rounded-lg text-[13px] text-[#9B9589]">Cancel</button>
            <button onClick={sendCampaign} disabled={!composeSubject.trim()} className="btn-gold text-[13px] disabled:opacity-50 flex items-center gap-2">
              <Send className="w-3.5 h-3.5" />Send Campaign
            </button>
          </div>
        </motion.div>
      )}

      {/* Client Satisfaction */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#C8A55C]" />Client Satisfaction Monitor
        </h2>
        <div className="space-y-2">
          {clients.map((client, i) => (
            <motion.div key={client.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold">{client.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${client.status === 'active' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : client.status === 'at_risk' ? 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]' : 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]'}`}>
                      {client.status}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(200,165,92,0.1)] text-[#C8A55C]">{client.tier}</span>
                  </div>
                  <p className="text-[11px] text-[#9B9589]">{client.email} | Last active: {client.lastActive}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <div className={`text-[16px] font-semibold ${client.satisfaction >= 90 ? 'text-[#4ADE80]' : client.satisfaction >= 75 ? 'text-[#C8A55C]' : 'text-[#EF4444]'}`}>{client.satisfaction}%</div>
                    <div className="text-[9px] text-[#9B9589]">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[16px] font-semibold text-[#F5F0E8]">{client.ebooksPublished}</div>
                    <div className="text-[9px] text-[#9B9589]">eBooks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[16px] font-semibold text-[#C8A55C]">${client.revenue}</div>
                    <div className="text-[9px] text-[#9B9589]">Revenue</div>
                  </div>
                </div>
              </div>
              {/* Satisfaction bar */}
              <div className="mt-3 h-1.5 rounded-full bg-[rgba(245,240,232,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${client.satisfaction}%`,
                    background: client.satisfaction >= 90 ? '#4ADE80' : client.satisfaction >= 75 ? '#C8A55C' : '#EF4444',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Automated Marketing Actions */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#C8A55C]" />Automated Marketing Flows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketingActions.map((action, i) => (
            <motion.div key={action.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-semibold">{action.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${action.status === 'active' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]'}`}>{action.status}</span>
              </div>
              <p className="text-[11px] text-[#9B9589] mb-2">Trigger: {action.trigger}</p>
              <div className="flex gap-3 text-[11px] text-[#9B9589]">
                <span>Sent: {action.sent.toLocaleString()}</span>
                <span>Open: {action.sent > 0 ? Math.round(action.opened / action.sent * 100) : 0}%</span>
                <span>Click: {action.sent > 0 ? Math.round(action.clicked / action.sent * 100) : 0}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Agent Protocol */}
      <section className="glass-surface p-5 border border-[rgba(200,165,92,0.1)]">
        <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#C8A55C]" />Marketing Agent Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] text-[#9B9589]">
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Primary Responsibilities:</p>
            <ul className="space-y-1">
              <li>• Monitor client satisfaction scores (target: 95%+ average)</li>
              <li>• Ensure accurate package delivery matching client tier</li>
              <li>• Automate targeted email campaigns based on behavior triggers</li>
              <li>• Identify at-risk clients and trigger retention campaigns</li>
              <li>• Coordinate with Social Media Agent on joint campaigns</li>
            </ul>
          </div>
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Cooperation with Social Media Agent:</p>
            <ul className="space-y-1">
              <li>• Share campaign calendars to avoid message collision</li>
              <li>• Joint campaigns must achieve 95% confidence before launch</li>
              <li>• Marketing Agent provides audience segments; Social Agent crafts content</li>
              <li>• Weekly sync on campaign performance and adjustments</li>
              <li>• Cross-promote: email drives social follows, social drives email signups</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
