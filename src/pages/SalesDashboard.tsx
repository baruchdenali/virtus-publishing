import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, TrendingUp, Target, Phone, Mail, Plus, Check, X, Edit3, Trash2, Building2, Star, Package, CreditCard, Award, BarChart3 } from 'lucide-react'

interface Lead {
  id: number
  name: string
  email: string
  company: string
  phone: string
  tier: string
  value: number
  status: string
  notes: string
  assignedTo: string
  createdAt: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

const initialLeads: Lead[] = [
  { id: 1, name: 'Dr. Sarah Mitchell', email: 's.mitchell@university.edu', company: 'State University Press', phone: '(212) 555-0142', tier: 'Enterprise', value: 15000, status: 'qualified', notes: 'Interested in white-label platform for 200+ faculty. Needs SSO integration.', assignedTo: 'Sales Team', createdAt: '2026-05-28' },
  { id: 2, name: 'Robert Chen', email: 'r.chen@brightpub.com', company: 'Brightlight Publishing', tier: 'Publisher', value: 8940, status: 'proposal', notes: 'Moving from competitor. Needs bulk management and API access.', assignedTo: 'Sales Team', createdAt: '2026-05-26' },
  { id: 3, name: 'Lisa Johnson', email: 'lisa.j@greenlibrary.org', company: 'Greenleaf Library Network', tier: 'Enterprise', value: 8500, status: 'negotiation', notes: 'Carbon-neutral publishing aligns with their mission. Fast track possible.', assignedTo: 'Sales Team', createdAt: '2026-05-25' },
  { id: 4, name: 'Marcus Rivera', email: 'm.rivera@writersguild.net', company: 'Independent', tier: 'Professional', value: 1476, status: 'qualified', notes: 'Guild member referral. Wants audiobook and marketing toolkit bundle.', assignedTo: 'Sales Team', createdAt: '2026-05-29' },
  { id: 5, name: 'Amara Okafor', email: 'amara.okafor@africanlit.org', company: 'African Literature Foundation', tier: 'Enterprise', value: 12000, status: 'new', notes: 'Non-profit rate requested. 50+ authors need publishing tools.', assignedTo: 'Sales Team', createdAt: '2026-06-01' },
]

const statusColors: Record<string, string> = {
  new: 'bg-[rgba(107,155,209,0.12)] text-[#6B9BD1]',
  qualified: 'bg-[rgba(200,165,92,0.12)] text-[#C8A55C]',
  proposal: 'bg-[rgba(168,130,220,0.12)] text-[#A882DC]',
  negotiation: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
  closed_won: 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]',
  closed_lost: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
}

export default function SalesDashboard() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState<Partial<Lead>>({ name: '', email: '', company: '', phone: '', tier: 'Professional', value: 0, status: 'new', notes: '' })

  const totalPipeline = leads.reduce((sum, l) => sum + l.value, 0)
  const totalWon = leads.filter(l => l.status === 'closed_won').reduce((sum, l) => sum + l.value, 0)
  const avgDeal = leads.length > 0 ? Math.round(totalPipeline / leads.length) : 0
  const winRate = leads.filter(l => l.status === 'closed_won').length / leads.filter(l => l.status === 'closed_won' || l.status === 'closed_lost').length * 100 || 0

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  function resetForm() {
    setForm({ name: '', email: '', company: '', phone: '', tier: 'Professional', value: 0, status: 'new', notes: '' })
    setEditId(null)
  }

  function saveLead() {
    if (!form.name?.trim() || !form.email?.trim()) return
    if (editId) {
      setLeads(prev => prev.map(l => l.id === editId ? { ...l, ...form } as Lead : l))
    } else {
      setLeads(prev => [{ id: Date.now(), ...form as Lead, assignedTo: 'Sales Team', createdAt: new Date().toISOString().slice(0, 10) }, ...prev])
    }
    resetForm()
    setShowAdd(false)
  }

  function startEdit(lead: Lead) {
    setForm({ name: lead.name, email: lead.email, company: lead.company, phone: lead.phone, tier: lead.tier, value: lead.value, status: lead.status, notes: lead.notes })
    setEditId(lead.id)
    setShowAdd(true)
  }

  function deleteLead(id: number) {
    if (confirm('Delete this lead?')) setLeads(prev => prev.filter(l => l.id !== id))
  }

  function advanceStatus(id: number) {
    const flow = ['new', 'qualified', 'proposal', 'negotiation', 'closed_won']
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      const idx = flow.indexOf(l.status)
      return { ...l, status: idx < flow.length - 1 ? flow[idx + 1] : l.status }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[#C8A55C]" />
            <h1 className="text-[28px] font-semibold">Sales Dashboard</h1>
          </div>
          <p className="text-[13px] text-[#9B9589]">Manage leads, track pipeline, close deals.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(!showAdd) }} className="btn-gold text-[13px] flex items-center gap-2">
          <Plus className="w-4 h-4" />{showAdd ? 'Close' : 'Add Lead'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline', value: `$${(totalPipeline / 1000).toFixed(1)}k`, icon: Target, color: '#C8A55C' },
          { label: 'Closed Won', value: `$${(totalWon / 1000).toFixed(1)}k`, icon: Award, color: '#4ADE80' },
          { label: 'Avg Deal', value: `$${avgDeal.toLocaleString()}`, icon: CreditCard, color: '#6B9BD1' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, icon: TrendingUp, color: '#D9BC7A' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-surface p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              <span className="text-[11px] text-[#9B9589]">{kpi.label}</span>
            </div>
            <div className="text-[22px] font-semibold" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#C8A55C]" />Pipeline
        </h2>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {['new', 'qualified', 'proposal', 'negotiation', 'closed_won'].map(s => (
            <div key={s} className="min-w-[120px] flex-1">
              <div className="text-[11px] text-[#9B9589] uppercase tracking-wider mb-1 text-center">{s.replace('_', ' ')}</div>
              <div className="text-[20px] font-semibold text-center text-[#C8A55C]">
                ${(leads.filter(l => l.status === s).reduce((sum, l) => sum + l.value, 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-[#9B9589] text-center">{leads.filter(l => l.status === s).length} deals</div>
            </div>
          ))}
        </div>
      </section>

      {/* Add/Edit Lead */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-surface p-6 space-y-3">
          <h3 className="text-[16px] font-semibold">{editId ? 'Edit Lead' : 'New Lead'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field text-[13px]" placeholder="Contact Name *" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="field text-[13px]" placeholder="Email *" />
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="field text-[13px]" placeholder="Company" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="field text-[13px]" placeholder="Phone" />
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="field text-[13px]">
              {['Creator', 'Professional', 'Publisher', 'Enterprise'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="field text-[13px]" placeholder="Deal Value ($)" />
          </div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="field text-[13px] h-16 resize-none" placeholder="Notes..." />
          <div className="flex justify-end gap-2">
            <button onClick={() => { resetForm(); setShowAdd(false) }} className="px-4 py-2 rounded-lg text-[13px] text-[#9B9589]">Cancel</button>
            <button onClick={saveLead} disabled={!form.name?.trim() || !form.email?.trim()} className="btn-gold text-[13px] disabled:opacity-50">{editId ? 'Update' : 'Save'} Lead</button>
          </div>
        </motion.div>
      )}

      {/* Leads Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C8A55C]" />Leads
          </h2>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="field text-[12px] py-1.5">
            <option value="all">All Statuses</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.map((lead, i) => (
            <motion.div key={lead.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold">{lead.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${statusColors[lead.status]}`}>{lead.status.replace('_', ' ')}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(200,165,92,0.1)] text-[#C8A55C]">{lead.tier}</span>
                  </div>
                  <p className="text-[11px] text-[#9B9589]">{lead.company} | {lead.email}</p>
                  {lead.notes && <p className="text-[11px] text-[#9B9589] mt-0.5 italic">{lead.notes}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[14px] font-semibold text-[#C8A55C]">${lead.value.toLocaleString()}</span>
                  {lead.status !== 'closed_won' && lead.status !== 'closed_lost' && (
                    <button onClick={() => advanceStatus(lead.id)} className="w-8 h-8 rounded-lg bg-[rgba(74,222,128,0.12)] flex items-center justify-center hover:bg-[rgba(74,222,128,0.2)]" title="Advance">
                      <Check className="w-4 h-4 text-[#4ADE80]" />
                    </button>
                  )}
                  <button onClick={() => startEdit(lead)} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)]">
                    <Edit3 className="w-3.5 h-3.5 text-[#9B9589]" />
                  </button>
                  <button onClick={() => deleteLead(lead.id)} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.15)]">
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#C8A55C]" />Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Phone, label: 'Call Script', desc: 'Enterprise pitch template' },
            { icon: Mail, label: 'Email Templates', desc: 'Follow-up sequences' },
            { icon: Package, label: 'Pricing Sheet', desc: 'All tiers + add-ons' },
            { icon: Award, label: 'Competitor Intel', desc: 'Comparison matrix' },
          ].map((action) => (
            <button key={action.label} onClick={() => alert(`${action.label}: Feature available in full version.`)} className="glass-surface p-4 text-left card-hover">
              <action.icon className="w-5 h-5 text-[#C8A55C] mb-2" />
              <div className="text-[13px] font-medium">{action.label}</div>
              <div className="text-[11px] text-[#9B9589]">{action.desc}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
