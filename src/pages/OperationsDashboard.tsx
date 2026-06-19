import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Shield, Users, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock,
  DollarSign, Target, Megaphone, Share2, Lock, Unlock, Loader2
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

export default function OperationsDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasAccess = user?.role === 'admin' || user?.role === 'operations'

  const { data: team, isLoading: teamLoading } = trpc.team.list.useQuery(undefined, { enabled: hasAccess })
  const { data: campaigns } = trpc.campaign.list.useQuery(undefined, { enabled: hasAccess })
  const { data: leads } = trpc.salesLead.list.useQuery(undefined, { enabled: hasAccess })
  const utils = trpc.useUtils()
  const updateRole = trpc.team.updateRole.useMutation({ onSuccess: () => utils.team.list.invalidate() })

  const [showInvite, setShowInvite] = useState(false)

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="w-16 h-16 text-[#C27070] mb-4" />
        <h2 className="text-[24px] font-semibold mb-2">Access Denied</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">You need operations privileges to access this dashboard.</p>
        <button onClick={() => navigate('/')} className="btn-gold text-[13px]">Back to Home</button>
      </div>
    )
  }

  const teamMembers = team ?? []
  const totalRevenue = (leads ?? []).reduce((sum: number, l: any) => sum + Number(l.value ?? 0), 0)
  const activeTeam = teamMembers.filter((m: any) => m.role === 'sales' || m.role === 'operations').length
  const totalLeads = (leads ?? []).length
  const totalClosed = (leads ?? []).filter((l: any) => l.status === 'closed_won').length
  const conversionRate = totalLeads > 0 ? Math.round((totalClosed / totalLeads) * 100) : 0

  const pipelineSnapshot = [
    { stage: 'New Leads', count: (leads ?? []).filter((l: any) => l.status === 'new').length, value: (leads ?? []).filter((l: any) => l.status === 'new').reduce((s: number, l: any) => s + Number(l.value ?? 0), 0) },
    { stage: 'Qualified', count: (leads ?? []).filter((l: any) => l.status === 'qualified').length, value: (leads ?? []).filter((l: any) => l.status === 'qualified').reduce((s: number, l: any) => s + Number(l.value ?? 0), 0) },
    { stage: 'Proposal', count: (leads ?? []).filter((l: any) => l.status === 'proposal').length, value: (leads ?? []).filter((l: any) => l.status === 'proposal').reduce((s: number, l: any) => s + Number(l.value ?? 0), 0) },
    { stage: 'Negotiation', count: (leads ?? []).filter((l: any) => l.status === 'negotiation').length, value: (leads ?? []).filter((l: any) => l.status === 'negotiation').reduce((s: number, l: any) => s + Number(l.value ?? 0), 0) },
    { stage: 'Closed Won', count: (leads ?? []).filter((l: any) => l.status === 'closed_won').length, value: (leads ?? []).filter((l: any) => l.status === 'closed_won').reduce((s: number, l: any) => s + Number(l.value ?? 0), 0) },
  ]
  const pipelineTotal = pipelineSnapshot.reduce((s, p) => s + p.value, 0)

  const agentStatuses = [
    { name: 'Social Media Agent', type: 'social' as const, status: 'running' as const, campaignsActive: (campaigns ?? []).filter((c: any) => c.status === 'running').length, campaignsTotal: (campaigns ?? []).length, lastRun: '15m ago', confidence: 94 },
    { name: 'Marketing Agent', type: 'marketing' as const, status: 'running' as const, campaignsActive: (campaigns ?? []).filter((c: any) => c.status === 'running').length, campaignsTotal: (campaigns ?? []).length, lastRun: '32m ago', confidence: 97 },
  ]

  const roleColors: Record<string, string> = {
    admin: 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]',
    operations: 'bg-[rgba(168,130,220,0.15)] text-[#A882DC]',
    sales: 'bg-[rgba(107,155,209,0.15)] text-[#6B9BD1]',
    user: 'bg-[rgba(156,163,175,0.15)] text-[#9CA3AF]',
  }

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
          <motion.div key={kpi.label} custom={i + 1} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3"><kpi.icon className={`w-5 h-5 ${kpi.color}`} /></div>
            <p className="text-[24px] font-bold text-[#F5F0E8] mb-0.5">{kpi.value}</p>
            <p className="text-[12px] text-[#9B9589]">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Snapshot */}
          <motion.div custom={5} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5"><BarChart3 className="w-5 h-5 text-[#C8A55C]" /><h2 className="text-[16px] font-semibold text-[#F5F0E8]">Sales Pipeline Snapshot</h2></div>
              <span className="text-[12px] text-[#9B9589]">{totalLeads} deals · ${(pipelineTotal / 1000).toFixed(0)}K total</span>
            </div>
            <div className="space-y-3">
              {pipelineSnapshot.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <span className="w-28 text-[12px] font-medium text-[#9B9589] shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-8 bg-[#1A1A1F] rounded-lg overflow-hidden relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pipelineTotal > 0 ? Math.min((stage.value / pipelineTotal) * 100 * 2.5, 100) : 0}%` }} transition={{ duration: 0.8 }} className="h-full bg-[rgba(200,165,92,0.15)] rounded-lg" />
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
          <motion.div custom={6} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5"><Share2 className="w-5 h-5 text-[#C8A55C]" /><h2 className="text-[16px] font-semibold text-[#F5F0E8]">Automated Agents Monitor</h2></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" /><span className="text-[11px] text-[#4ADE80] font-medium">All Systems Operational</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentStatuses.map((agent) => (
                <div key={agent.name} className="bg-[#1A1A1F] rounded-lg p-4 border border-[rgba(245,240,232,0.04)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {agent.type === 'social' ? <Share2 className="w-4 h-4 text-[#6B9BD1]" /> : <Megaphone className="w-4 h-4 text-[#A882DC]" />}
                      <span className="text-[13px] font-semibold text-[#F5F0E8]">{agent.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.12)] text-[#4ADE80]">RUNNING</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center"><p className="text-[16px] font-bold text-[#F5F0E8]">{agent.campaignsActive}</p><p className="text-[10px] text-[#9B9589]">Active</p></div>
                    <div className="text-center"><p className="text-[16px] font-bold text-[#F5F0E8]">{agent.campaignsTotal}</p><p className="text-[10px] text-[#9B9589]">Total</p></div>
                    <div className="text-center"><p className="text-[16px] font-bold text-[#4ADE80]">{agent.confidence}%</p><p className="text-[10px] text-[#9B9589]">Confidence</p></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9B9589]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last run: {agent.lastRun}</span>
                    {agent.confidence >= 95 ? <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Team */}
        <div className="space-y-6">
          {/* Team Roster */}
          <motion.div custom={8} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5"><Users className="w-5 h-5 text-[#C8A55C]" /><h2 className="text-[16px] font-semibold text-[#F5F0E8]">Team Roster</h2></div>
              <button onClick={() => navigate('/settings')} className="text-[11px] text-[#9B9589] hover:text-[#C8A55C]">Manage</button>
            </div>
            {teamLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#C8A55C] animate-spin" /></div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {teamMembers.map((member: any) => (
                  <div key={member.id} className="bg-[#1A1A1F] rounded-lg p-3.5 border border-[rgba(245,240,232,0.04)]">
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
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${roleColors[member.role]}`}>{member.role.toUpperCase()}</span>
                    </div>
                    <p className="text-[9px] text-[#9B9589]">Joined: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
                {teamMembers.length === 0 && <p className="text-[12px] text-[#9B9589] text-center py-4">No team members yet.</p>}
              </div>
            )}
          </motion.div>

          {/* Compliance */}
          <motion.div custom={9} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4"><CheckCircle className="w-5 h-5 text-[#4ADE80]" /><h2 className="text-[16px] font-semibold text-[#F5F0E8]">Compliance Check</h2></div>
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
          <motion.div custom={10} variants={fadeInUp} initial="hidden" animate="visible" className="bg-[#232328] border border-[rgba(245,240,232,0.06)] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4"><AlertTriangle className="w-5 h-5 text-[#F59E0B]" /><h2 className="text-[16px] font-semibold text-[#F5F0E8]">Alert Feed</h2></div>
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
