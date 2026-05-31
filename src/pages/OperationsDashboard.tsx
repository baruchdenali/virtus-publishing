import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Target, Megaphone, Share2, UserCheck, UserX, Mail, Phone, Building2, Star, ArrowUpRight, ArrowDownRight, Activity, Lock, Unlock } from 'lucide-react'

interface TeamMember {
  id: number
  name: string
  email: string
  role: 'admin' | 'operations' | 'sales' | 'user'
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
  leadsAssigned: number
  leadsClosed: number
  revenue: number
}

interface PipelineSnapshot {
  stage: string
  count: number
  value: number
  color: string
}

interface AgentStatus {
  name: string
  type: 'social' | 'marketing'
  status: 'running' | 'paused' | 'error'
  campaignsActive: number
  campaignsTotal: number
  lastRun: string
  confidence: number
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const initialTeam: TeamMember[] = [
  { id: 1, name: 'Baruch Denali', email: 'baruch.denali@virtuspublishing.us', role: 'admin', status: 'active', lastActive: 'Now', leadsAssigned: 0, leadsClosed: 0, revenue: 0 },
  { id: 2, name: 'Sales Team Alpha', email: 'sales.alpha@virtuspublishing.us', role: 'sales', status: 'active', lastActive: '2h ago', leadsAssigned: 12, leadsClosed: 8, revenue: 45200 },
  { id: 3, name: 'Sales Team Beta', email: 'sales.beta@virtuspublishing.us', role: 'sales', status: 'active', lastActive: '5h ago', leadsAssigned: 8, leadsClosed: 5, revenue: 28300 },
  { id: 4, name: 'Ops Manager', email: 'ops.manager@virtuspublishing.us', role: 'operations', status: 'active', lastActive: '1h ago', leadsAssigned: 0, leadsClosed: 0, revenue: 0 },
  { id: 5, name: 'Marketing Lead', email: 'marketing@virtuspublishing.us', role: 'operations', status: 'pending', lastActive: 'Never', leadsAssigned: 0, leadsClosed: 0, revenue: 0 },
]

const pipelineSnapshot: PipelineSnapshot[] = [
  { stage: 'New Leads', count: 18, value: 127500, color: 'bg-[rgba(107,155,209,0.15)] text-[#6B9BD1]' },
  { stage: 'Qualified', count: 12, value: 89400, color: 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' },
  { stage: 'Proposal', count: 7, value: 52300, color: 'bg-[rgba(168,130,220,0.15)] text-[#A882DC]' },
  { stage: 'Negotiation', count: 4, value: 34100, color: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]' },
  { stage: 'Closed Won', count: 13, value: 73500, color: 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]' },
]

const agentStatuses: AgentStatus[] = [
  { name: 'Social Media Agent', type: 'social', status: 'running', campaignsActive: 3, campaignsTotal: 12, lastRun: '15m ago', confidence: 94 },
  { name: 'Marketing Agent', type: 'marketing', status: 'running', campaignsActive: 5, campaignsTotal: 8, lastRun: '32m ago', confidence: 97 },
]

const roleColors: Record<string, string> = {
  admin: 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]',
  operations: 'bg-[rgba(168,130,220,0.15)] text-[#A882DC]',
  sales: 'bg-[rgba(107,155,209,0.15)] text-[#6B9BD1]',
  user: 'bg-[rgba(156,163,175,0.15)] text-[#9CA3AF]',
}

const statusIcons: Record<string, any> = {
  active: CheckCircle,
  inactive: UserX,
  pending: Clock,
}

export default function OperationsDashboard() {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'sales' | 'operations'>('sales')
  const [filterRole, setFilterRole] = useState('all')

  const totalRevenue = team.reduce((sum, m) => sum + m.revenue, 0)
  const activeTeam = team.filter(m => m.status === 'active').length
  const totalLeads = team.reduce((sum, m) => sum + m.leadsAssigned, 0)
  const totalClosed = team.reduce((sum, m) => sum + m.leadsClosed, 0)
  const conversionRate = totalLeads > 0 ? Math.round((totalClosed / totalLeads) * 100) : 0

  const pipelineTotal = pipelineSnapshot.reduce((sum, s) => sum + s.value, 0)

  function toggleStatus(id: number) {
    setTeam(prev => prev.map(m => {
      if (m.id === id) {
        const next = m.status === 'active' ? 'inactive' : m.status === 'inactive' ? 'pending' : 'active'
        return { ...m, status: next }
      }
      return m
    }))
  }

  function inviteMember() {
    if (!inviteEmail.trim()) return
    const newMember: TeamMember = {
      id: team.length + 1,
      name: inviteEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: inviteEmail.toLowerCase().trim(),
      role: inviteRole,
      status: 'pending',
      lastActive: 'Never',
      leadsAssigned: 0,
      leadsClosed: 0,
      revenue: 0,
    }
    setTeam([...team, newMember])
    setInviteEmail('')
    setShowInvite(false)
  }

  const filteredTeam = filterRole === 'all' ? team : team.filter(m => m.role === filterRole)

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-[#C8A55C]" />
          <h1 className="text-[28px] font-bold text-[#F5F0E8]">Operations Command</h1>
        </div>
        <p className="text-[14px] text-[#9B9589]">Supervise sales teams, monitor automated agents, and manage team accounts.</p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Pipeline', value: `$${(pipelineTotal / 1000).toFixed(0)}K`, icon: DollarSign, change: '+12%', up: true, color: 'text-[#C8A55C]' },
          { label: 'Active Team', value: `${activeTeam}`, icon: Users, change: '+2', up: true, color: 'text-[#6B9BD1]' },
          { label: 'Total Leads', value: `${totalLeads}`, icon: Target, change: '+5', up: true, color: 'text-[#A882DC]' },
          { label: 'Win Rate', value: `${conversionRate}%`, icon: TrendingUp, change: conversionRate >= 50 ? '+3%' : '-2%', up: conversionRate >= 50, color: 'text-[#4ADE80]' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i + 1}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`flex items-center gap-0.5 text-[11px] font-medium ${kpi.up ? 'text-[#4ADE80]' : 'text-[#EF4444]'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-[24px] font-bold text-[#F5F0E8] mb-0.5">{kpi.value}</p>
            <p className="text-[12px] text-[#9B9589]">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pipeline + Agents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Pipeline Snapshot */}
          <motion.div
            custom={5}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#C8A55C]" />
                <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Sales Pipeline Snapshot</h2>
              </div>
              <span className="text-[12px] text-[#9B9589]">{pipelineSnapshot.reduce((s, p) => s + p.count, 0)} deals · ${(pipelineTotal / 1000).toFixed(0)}K total</span>
            </div>
            <div className="space-y-3">
              {pipelineSnapshot.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <span className="w-28 text-[12px] font-medium text-[#9B9589] shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-8 bg-[#1A1A1F] rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stage.value / pipelineTotal) * 100 * 2.5, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${stage.color.split(' ')[0]} rounded-lg`}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-[11px] font-semibold text-[#F5F0E8] z-10">{stage.count} deals</span>
                      <span className="text-[11px] font-medium text-[#9B9589] z-10">${(stage.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Agent Monitor */}
          <motion.div
            custom={6}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#C8A55C]" />
                <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Automated Agents Monitor</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-[11px] text-[#4ADE80] font-medium">All Systems Operational</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentStatuses.map((agent) => (
                <div key={agent.name} className="bg-[#1A1A1F] rounded-lg p-4 border border-[rgba(245,240,232,0.04)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {agent.type === 'social' ? <Share2 className="w-4 h-4 text-[#6B9BD1]" /> : <Megaphone className="w-4 h-4 text-[#A882DC]" />}
                      <span className="text-[13px] font-semibold text-[#F5F0E8]">{agent.name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${agent.status === 'running' ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : agent.status === 'paused' ? 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]' : 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]'}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-[#F5F0E8]">{agent.campaignsActive}</p>
                      <p className="text-[10px] text-[#9B9589]">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-[#F5F0E8]">{agent.campaignsTotal}</p>
                      <p className="text-[10px] text-[#9B9589]">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-bold text-[#4ADE80]">{agent.confidence}%</p>
                      <p className="text-[10px] text-[#9B9589]">Confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9B9589]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last run: {agent.lastRun}</span>
                    {agent.confidence >= 95 ? <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sales Performance by Stage */}
          <motion.div
            custom={7}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <TrendingUp className="w-5 h-5 text-[#C8A55C]" />
              <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Revenue This Quarter</h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                const heights = [45, 62, 38, 78, 92, 55]
                const values = [12.4, 18.2, 9.8, 24.5, 31.2, 15.6]
                return (
                  <div key={month} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-[#1A1A1F] rounded-lg h-24 relative overflow-hidden flex items-end justify-center p-1.5">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heights[i]}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="w-full bg-gradient-to-t from-[rgba(200,165,92,0.3)] to-[rgba(200,165,92,0.08)] rounded-md"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#9B9589]">{month}</span>
                    <span className="text-[11px] font-semibold text-[#F5F0E8]">${values[i]}K</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Team Management */}
        <div className="space-y-6">
          {/* Team Roster */}
          <motion.div
            custom={8}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#C8A55C]" />
                <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Team Roster</h2>
              </div>
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="btn-gold text-[11px] py-1.5 px-3"
              >
                + Invite
              </button>
            </div>

            {/* Invite Form */}
            {showInvite && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-[#1A1A1F] rounded-lg border border-[rgba(200,165,92,0.15)] space-y-2"
              >
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Last.First@virtuspublishing.us"
                  className="w-full bg-[#232328] border border-[rgba(245,240,232,0.08)] rounded-lg px-3 py-2 text-[12px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C]"
                />
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'sales' | 'operations')}
                  className="w-full bg-[#232328] border border-[rgba(245,240,232,0.08)] rounded-lg px-3 py-2 text-[12px] text-[#F5F0E8] outline-none focus:border-[#C8A55C]"
                >
                  <option value="sales">Sales Team</option>
                  <option value="operations">Operations</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={inviteMember} className="flex-1 btn-gold text-[11px] py-1.5">Send Invite</button>
                  <button onClick={() => setShowInvite(false)} className="px-3 py-1.5 text-[11px] text-[#9B9589] hover:text-[#F5F0E8] transition-colors">Cancel</button>
                </div>
              </motion.div>
            )}

            {/* Role Filter */}
            <div className="flex gap-1.5 mb-4">
              {['all', 'admin', 'operations', 'sales'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${filterRole === r ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'text-[#9B9589] hover:text-[#F5F0E8]'}`}
                >
                  {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {/* Team List */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredTeam.map((member) => {
                const StatusIcon = statusIcons[member.status] || Clock
                return (
                  <div key={member.id} className="bg-[#1A1A1F] rounded-lg p-3.5 border border-[rgba(245,240,232,0.04)] group hover:border-[rgba(200,165,92,0.1)] transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2E2E35] flex items-center justify-center text-[12px] font-bold text-[#C8A55C]">
                          {(member.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-[#F5F0E8]">{member.name}</p>
                          <p className="text-[10px] text-[#9B9589]">{member.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(member.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Toggle status"
                      >
                        {member.status === 'active' ? <Lock className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Unlock className="w-3.5 h-3.5 text-[#4ADE80]" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${roleColors[member.role]}`}>
                        {member.role.toUpperCase()}
                      </span>
                      <span className={`flex items-center gap-0.5 text-[9px] font-medium ${member.status === 'active' ? 'text-[#4ADE80]' : member.status === 'pending' ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {member.status}
                      </span>
                    </div>
                    {member.role === 'sales' && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[11px] font-semibold text-[#F5F0E8]">{member.leadsAssigned}</p>
                          <p className="text-[9px] text-[#9B9589]">Assigned</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-[#4ADE80]">{member.leadsClosed}</p>
                          <p className="text-[9px] text-[#9B9589]">Closed</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-[#C8A55C]">${(member.revenue / 1000).toFixed(1)}K</p>
                          <p className="text-[9px] text-[#9B9589]">Revenue</p>
                        </div>
                      </div>
                    )}
                    <p className="text-[9px] text-[#9B9589] mt-1.5">Last active: {member.lastActive}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Compliance Check */}
          <motion.div
            custom={9}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <CheckCircle className="w-5 h-5 text-[#4ADE80]" />
              <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Compliance Check</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'SOC 2 Type II', status: 'compliant', date: 'Audited: Mar 2026' },
                { label: 'GDPR Data Processing', status: 'compliant', date: 'Reviewed: May 2026' },
                { label: 'CCPA Compliance', status: 'compliant', date: 'Reviewed: May 2026' },
                { label: 'Stripe PCI DSS', status: 'compliant', date: 'Auto-renewing' },
                { label: 'Content Moderation AI', status: 'review', date: 'Due: Jun 15' },
                { label: 'Team Access Audit', status: 'review', date: 'Due: Jun 30' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    {item.status === 'compliant' ? <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />}
                    <span className="text-[12px] text-[#F5F0E8]">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-medium ${item.status === 'compliant' ? 'text-[#4ADE80]' : 'text-[#F59E0B]'}`}>{item.date}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alert Feed */}
          <motion.div
            custom={10}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-[16px] font-semibold text-[#F5F0E8]">Alert Feed</h2>
            </div>
            <div className="space-y-3">
              {[
                { level: 'high', message: 'Social Media Agent: Facebook auth expired', time: '1h ago' },
                { level: 'medium', message: 'Sales Team Beta: 2 leads need follow-up > 48h', time: '3h ago' },
                { level: 'low', message: 'Marketing Agent: Confidence dropped to 94%', time: '5h ago' },
                { level: 'info', message: 'New enterprise signup: State University Press', time: '8h ago' },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.level === 'high' ? 'bg-[#EF4444]' : alert.level === 'medium' ? 'bg-[#F59E0B]' : alert.level === 'low' ? 'bg-[#6B9BD1]' : 'bg-[#9B9589]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#F5F0E8] leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-[#9B9589]">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
