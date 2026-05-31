import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router'
import { Search, HelpCircle, BookOpen, CreditCard, Lock, FileText, MessageSquare, Mail, Phone, MapPin, ChevronDown, ChevronUp, Shield, Globe, User, Zap } from 'lucide-react'

const categories = [
  { id: 'getting-started', icon: BookOpen, label: 'Getting Started' },
  { id: 'account', icon: User, label: 'Account & Login' },
  { id: 'payments', icon: CreditCard, label: 'Payments & Billing' },
  { id: 'security', icon: Shield, label: 'Security & Privacy' },
  { id: 'publishing', icon: FileText, label: 'Publishing & eBooks' },
  { id: 'technical', icon: Zap, label: 'Technical Issues' },
]

const faqs = [
  {
    q: 'How do I create an account?',
    a: 'Click "Sign In" in the top navigation, then select "New Account". Enter your name, email address, and a password (minimum 6 characters). Click "Create Account" and you are ready to start publishing.',
    cat: 'getting-started',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also accept debit cards with these logos. All payments are processed securely through Stripe with PCI DSS Level 1 compliance.',
    cat: 'payments',
  },
  {
    q: 'How do I create my first eBook?',
    a: 'After logging in, click "Create eBook" in the navigation bar. Our AI assistant will guide you through the process: choose a topic, generate an outline, write chapters, and publish. You can also upload your own manuscript.',
    cat: 'getting-started',
  },
  {
    q: 'Is my content secure?',
    a: 'Absolutely. We use military-grade AES-256 encryption for all manuscripts. Your content is encrypted at rest and in transit. We never share or access your work without explicit permission.',
    cat: 'security',
  },
  {
    q: 'How do I reset my password?',
    a: 'Currently, contact our support team at publishing@virtus-edu.net to reset your password. We are implementing automated password recovery soon.',
    cat: 'account',
  },
  {
    q: 'Can I sell my eBooks through Virtus?',
    a: 'Yes! Once you publish an eBook, it appears in our integrated digital bookstore. You set your own price or offer it for free. We handle secure downloads and you keep the majority of each sale.',
    cat: 'publishing',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support EPUB, PDF, and Markdown formats for eBooks. You can export your work in any of these formats from the editor.',
    cat: 'technical',
  },
  {
    q: 'How does the AI writing assistant work?',
    a: 'Our AI assistant helps generate outlines, write chapters, enhance text, and polish your manuscript. Simply describe your idea and the AI will guide you step by step. All AI processing happens in a secure, encrypted environment.',
    cat: 'publishing',
  },
  {
    q: 'Is Virtus Publishing environmentally friendly?',
    a: 'Yes! Virtus Publishing is 100% paperless and carbon-neutral. By publishing digitally, you eliminate printing, shipping, and physical storage. Every eBook published through Virtus saves an estimated 2.5 kg of CO2.',
    cat: 'publishing',
  },
  {
    q: 'What languages are supported?',
    a: 'Our platform supports 10 languages: English, Spanish, French, German, Portuguese, Russian, Chinese, Japanese, Arabic, and Hebrew. We also provide full RTL (right-to-left) support for Arabic and Hebrew.',
    cat: 'technical',
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach our support team via email at publishing@virtus-edu.net, by phone at (202) 984-5787, or through our offices in New York, Miami, and London.',
    cat: 'account',
  },
  {
    q: 'What is your refund policy?',
    a: 'We offer a 30-day money-back guarantee on all premium subscriptions. If you are not satisfied, contact us within 30 days for a full refund. Individual eBook purchases are non-refundable once downloaded.',
    cat: 'payments',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-surface card-hover"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-[14px] font-medium pr-4">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#C8A55C] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#9B9589] shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-[13px] text-[#9B9589] leading-relaxed border-t border-[rgba(245,240,232,0.06)] pt-3">
          {faq.a}
        </div>
      )}
    </motion.div>
  )
}

export default function HelpCenter() {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')

  const filtered = faqs.filter((f) => {
    const matchesSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCat === 'all' || f.cat === activeCat
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <HelpCircle className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Help Center</span>
        </div>
        <h1 className="text-[40px] md:text-[48px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          How can we <span className="text-gradient-gold">help?</span>
        </h1>
        <p className="text-[16px] text-[#9B9589] max-w-lg">
          Find answers to common questions about Virtus Publishing. If you need more help, our team is always available.
        </p>
      </motion.section>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9589]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for answers..."
          className="field pl-11 text-[14px] w-full"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${activeCat === 'all' ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589] hover:text-[#F5F0E8]'}`}
        >
          All Topics
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${activeCat === c.id ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589] hover:text-[#F5F0E8]'}`}
          >
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-[14px] text-[#9B9589] py-8">No results found. Try a different search term.</p>
        ) : (
          filtered.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)
        )}
      </div>

      {/* Contact Section */}
      <section className="glass-surface p-8 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <MessageSquare className="w-8 h-8 text-[#C8A55C] mx-auto mb-4" />
        <h2 className="text-[24px] font-semibold mb-3">Still need help?</h2>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto mb-6">
          Our support team is available Monday through Friday, 9 AM to 6 PM EST. We typically respond within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[13px]">
          <a href="mailto:publishing@virtus-edu.net" className="flex items-center gap-2 text-[#C8A55C] hover:text-[#D9BC7A] transition-colors">
            <Mail className="w-4 h-4" />publishing@virtus-edu.net
          </a>
          <a href="tel:+12029845787" className="flex items-center gap-2 text-[#C8A55C] hover:text-[#D9BC7A] transition-colors">
            <Phone className="w-4 h-4" />(202) 984-5787
          </a>
          <span className="flex items-center gap-2 text-[#9B9589]">
            <MapPin className="w-4 h-4 text-[#C8A55C]" />New York — Miami — London
          </span>
        </div>
      </section>
    </div>
  )
}
