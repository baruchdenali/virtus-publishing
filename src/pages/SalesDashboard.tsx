import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Target, DollarSign, TrendingUp, Users, Phone, Mail, Building2,
  FileText, MessageSquare, ChevronRight, Plus, X, Loader2, Trash2
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const statusColors: Record<string, string> = {
  new: 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]',
  qualified: 'bg-[rgba(200,165,92,0.12)] text-[#C8A55C]',
  proposal: 'bg-[rgba(168,130,220,0.12)] text-[#A882DC]',
  negotiation: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
  closed_won: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
  closed_lost: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
}

export default function SalesDashboard() {
  const { user } = useAuth()
  const hasAccess = user?.role === 'admin' || user?.role === 'operations' || user?.role === 'sales'
  const utils = trpc.useUtils()

  const { data: dbLeads, isLoading } = trpc.salesLead.list.useQuery(undefined, { enabled: hasAccess })
  const createLead = trpc.salesLead.create.useMutation({ onSuccess: () => utils.salesLead.list.invalidate() })
  const updateLead = trpc.salesLead.update.useMutation({ onSuccess: () => utils.salesLead.list.invalidate() })
  const deleteLead = trpc.salesLead.delete.useMutation({ onSuccess: () => utils.salesLead.list.invalidate() })

  const leads = dbLeads ?? []

  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    source: 'website', tier: undefined as string | undefined, notes: '', value: '', status: 'new'
  })
  const [filterStatus, setFilterStatus] = useState('all')

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Target className="w-16 h-16 text-[#C27070] mb-4" />
        <h2 className="text-[24px] font-semibold mb-2">Access Denied</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">You need sales team privileges to access this dashboard.</p>
      </div>
    )
  }

  const pipelineTotal = leads.reduce((sum: number, l: any) => sum + Number(l.value ?? 0), 0)
  const closedWon = leads.filter((l: any) => l.status === 'closed_won').reduce((sum: number, l: any) => sum + Number(l.value ?? 0), 0)
  const avgDeal = leads.length > 0 ? (pipelineTotal / leads.length) : 0
  const winRate = leads.filter((l: any) => l.status === 'closed_won' || l.status === 'closed_lost').length > 0
    ? Math.round((leads.filter((l: any) => l.status === 'closed_won').length / leads.filter((l: any) => l.status === 'closed_won' || l.status === 'closed_lost').length) * 100)
    : 0

  const stages = ['new', 'qualified', 'proposal', 'negotiation', 'closed_won']

  function resetForm() {
    setForm({ name: '', email: '', company: '', phone: '', source: 'website', tier: undefined, notes: '', value: '', status: 'new' })
    setEditId(null)
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return
    if (editId) {
      updateLead.mutate({
        id: editId,
        name: form.name, email: form.email, company: form.company,
        phone: form.phone, notes: form.notes, value: Number(form.value) || 0,
        status: form.status, tier: form.tier as any,
      }, { onSuccess: () => { resetForm(); setShowAdd(false) } })
    } else {
      createLead.mutate({
        name: form.name, email: form.email, company: form.company,
        phone: form.phone, notes: form.notes, value: Number(form.value) || 0,
        status: form.status, tier: form.tier as any, source: form.source,
      }, { onSuccess: () => { resetForm(); setShowAdd(false) } })
    }
  }

  function startEdit(lead: any) {
    setEditId(lead.id)
    setForm({
      name: lead.name, email: lead.email, company: lead.company ?? '',
      phone: lead.phone ?? '', source: lead.source ?? 'website',
      tier: lead.tier ?? undefined, notes: lead.notes ?? '',
      value: String(lead.value ?? ''), status: lead.status ?? 'new',
    })
    setShowAdd(true)
  }

  function advanceStatus(id: number, current: string) {
    const idx = stages.indexOf(current)
    if (idx >= 0 && idx < stages.length - 1) {
      updateLead.mutate({ id, status: stages[idx + 1] })
    }
  }

  const filteredLeads = filterStatus === 'all' ? leads : leads.filter((l: any) => l.status === filterStatus)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-[#C8A55C]" />
          <h1 className="text-[28px] font-semibold">Sales Dashboard</h1>
        </div>
        <p className="text-[13px] text-[#9B9589]">Pipeline, leads, and deal management.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline', value: `$${(pipelineTotal / 1000).toFixed(1)}K`, sub: `${leads.length} deals`, color: '#C8A55C' },
          { label: 'Closed Won', value: `$${(closedWon / 1000).toFixed(1)}K`, sub: `${leads.filter((l: any) => l.status === 'closed_won').length} deals`, color: '#4ADE80' },
          { label: 'Avg Deal', value: `$${avgDeal.toFixed(0)}`, sub: 'per lead', color: '#6B9BD1' },
          { label: 'Win Rate', value: `${winRate}%`, sub: 'conversion', color: '#A882DC' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} custom={i} variants={fadeInUp} initial="hidden" animate="visible" className="glass-surface p-5 text-center">
            <div className="text-[22px] font-semibold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[12px] font-medium mt-0.5">{kpi.label}</div>
            <div className="text-[10px] text-[#9B9589]">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <div className="glass-surface p-5">
        <h2 className="text-[14px] font-semibold mb-4 uppercase tracking-wider text-[#9B9589]">Pipeline Flow</h2>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {stages.map((stage, i) => {
            const count = leads.filter((l: any) => l.status === stage).length
            const value = leads.filter((l: any) => l.status === stage).reduce((s: number, l: any) => s + Number(l.value ?? 0), 0)
            return (
              <div key={stage} className="flex items-center gap-2">
                <div className="text-center min-w-[100px]">
                  <div className="text-[18px] font-semibold text-[#F5F0E8]">{count}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#9B9589]">{stage.replace('_', ' ')}</div>
                  <div className="text-[10px] text-[#C8A55C]">${(value / 1000).toFixed(0)}K</div>
                </div>
                {i < stages.length - 1 && <ChevronRight className="w-4 h-4 text-[#9B9589] shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Lead */}
      <div className="flex justify-end">
        <button onClick={() => { if (showAdd) { setShowAdd(false); resetForm() } else setShowAdd(true) }} className="btn-gold text-[13px] flex items-center gap-2">
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showAdd ? 'Cancel' : 'Add Lead'}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-surface p-5 space-y-3">
          <h3 className="text-[14px] font-semibold">{editId ? 'Edit Lead' : 'New Lead'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="field text-[13px]" placeholder="Name *" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="field text-[13px]" placeholder="Email *" />
            <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="field text-[13px]" placeholder="Company" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="field text-[13px]" placeholder="Phone" />
            <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="field text-[13px]" placeholder="Deal Value ($)" type="number" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="field text-[13px]">
              {stages.concat(['closed_lost']).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select value={form.tier ?? ''} onChange={e => setForm(f => ({ ...f, tier: e.target.value || undefined }))} className="field text-[13px]">
              <option value="">Select Tier...</option>
              <option value="creator">Creator</option>
              <option value="professional">Professional</option>
              <option value="publisher">Publisher</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="field text-[13px] h-16 resize-none w-full" placeholder="Notes..." />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowAdd(false); resetForm() }} className="px-3 py-1.5 text-[12px] text-[#9B9589]">Cancel</button>
            <button onClick={handleSubmit} disabled={(editId ? updateLead.isPending : createLead.isPending) || !form.name || !form.email} className="btn-gold text-[12px] disabled:opacity-50">
              {editId ? (updateLead.isPending ? 'Saving...' : 'Save Changes') : (createLead.isPending ? 'Adding...' : 'Add Lead')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Lead List */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {['all', ...stages, 'closed_lost'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${filterStatus === s ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'text-[#9B9589] hover:text-[#F5F0E8]'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-[#C8A55C] animate-spin" /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass-surface p-8 text-center"><p className="text-[13px] text-[#9B9589]">No leads yet. Click "Add Lead" to start your pipeline.</p></div>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map((lead: any, i: number) => (
            <motion.div key={lead.id} custom={i} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-surface p-4 card-hover cursor-pointer" onClick={() => startEdit(lead)}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${statusColors[lead.status]}`}>{lead.status?.replace('_', ' ')}</span>
                    {lead.tier && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(200,165,92,0.08)] text-[#C8A55C]">{lead.tier}</span>}
                    <span className="text-[10px] text-[#9B9589]">${Number(lead.value ?? 0).toLocaleString()}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold">{lead.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[#9B9589]">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                    {lead.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.company}</span>}
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                  </div>
                  {lead.notes && <p className="text-[11px] text-[#9B9589] mt-1">{lead.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {stages.indexOf(lead.status) >= 0 && stages.indexOf(lead.status) < stages.length - 1 && (
                    <button onClick={e => { e.stopPropagation(); advanceStatus(lead.id, lead.status) }} className="text-[11px] px-2 py-1 rounded bg-[rgba(74,222,128,0.1)] text-[#4ADE80] hover:bg-[rgba(74,222,128,0.2)] transition-colors flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />Advance
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete this lead?')) deleteLead.mutate({ id: lead.id }) }} className="p-1.5 rounded hover:bg-[rgba(239,68,68,0.1)] text-[#9B9589] hover:text-[#EF4444] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
