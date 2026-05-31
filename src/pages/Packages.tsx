import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Package, Sparkles, Star, Crown, Building2, Check, ArrowRight, BookOpen, PenTool, BarChart3, Globe, Lock, Zap, Palette, Mic, Headphones } from 'lucide-react'

const authorPackages = [
  {
    name: 'First-Time Author',
    tier: 'creator',
    price: 'Included with Creator ($29/mo)',
    description: 'Everything a first-time author needs to go from idea to published eBook.',
    services: [
      'AI-Powered Outline Generation',
      'Chapter-by-Chapter Writing Assistant',
      'Basic Cover Design (3 templates)',
      'EPUB & PDF Export',
      'Standard Distribution',
      'Community Forum Support',
    ],
  },
  {
    name: 'Independent Publisher',
    tier: 'professional',
    price: 'Included with Professional ($49/mo)',
    description: 'For authors building a catalog and growing their readership.',
    services: [
      'Everything in First-Time Author',
      'Advanced AI Writing Suite',
      'Premium Cover Design (20+ templates)',
      'Audiobook Narration (1 included)',
      'Marketing Toolkit Access',
      'Featured Placement Eligibility',
      'Priority Distribution Network',
      'Comprehensive Analytics',
    ],
  },
  {
    name: 'Publishing Empire',
    tier: 'publisher',
    price: 'Included with Publisher ($149/mo)',
    description: 'Maximum power for authors and small presses managing multiple titles.',
    services: [
      'Everything in Independent Publisher',
      'Premium AI Suite (unlimited)',
      'Custom Cover Design (AI-generated)',
      'Audiobook Narration (5 included)',
      'Full Marketing Automation',
      'Guaranteed Featured Placement (2/mo)',
      'Bulk eBook Management',
      'API Access for Integrations',
      'Team Collaboration (5 seats)',
      'Dedicated Account Manager',
    ],
  },
]

const enterprisePackages = [
  {
    name: 'University & Library',
    price: 'Starting at $5,000/year',
    description: 'Provide students and faculty with professional publishing tools.',
    features: [
      'Unlimited student accounts',
      'Course integration (LMS)',
      'Institutional branding',
      'Usage analytics dashboard',
      'Campus-wide distribution',
      'Faculty training sessions',
      'Priority technical support',
    ],
  },
  {
    name: 'Publishing House',
    price: 'Starting at $15,000/year',
    description: 'Full publishing pipeline for established publishers.',
    features: [
      'Everything in University plan',
      'Multi-editor collaboration',
      'Advanced workflow automation',
      'Custom distribution channels',
      'ISBN batch management',
      'Advanced reporting & analytics',
      'API access (unlimited)',
      'White-label options',
      'SSO integration',
    ],
  },
  {
    name: 'Corporate Communications',
    price: 'Starting at $25,000/year',
    description: 'Enterprise-grade publishing for corporate communications teams.',
    features: [
      'Everything in Publishing House',
      'Document compliance checking',
      'Brand guideline enforcement',
      'Multi-language team support',
      'Advanced security controls',
      'Audit trail & compliance reports',
      'On-premise deployment option',
      '24/7 phone support',
      '99.9% SLA guarantee',
    ],
  },
]

const aLaCarte = [
  { service: 'AI Cover Generation', price: '$10', desc: 'Professional AI-generated book cover' },
  { service: 'Chapter Writing (AI)', price: '$25/ch', desc: 'AI writes a full chapter from your outline' },
  { service: 'Professional Editing', price: '$50', desc: 'Grammar, style, and structure review' },
  { service: 'ISBN Registration', price: '$15', desc: 'Official ISBN for your eBook' },
  { service: 'Marketing Toolkit', price: '$30', desc: 'Social media kit, email templates, ads' },
  { service: 'Audiobook Creation', price: '$75', desc: 'AI-narrated audiobook version' },
  { service: 'Featured Placement', price: '$50/wk', desc: 'Homepage spotlight for your eBook' },
  { service: 'Category Banner', price: '$100/wk', desc: 'Top banner in your book category' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function Packages() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <Package className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Packages</span>
        </div>
        <h1 className="text-[40px] md:text-[48px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          Customized <span className="text-gradient-gold">Packages</span>
        </h1>
        <p className="text-[16px] text-[#9B9589] max-w-xl mx-auto">
          Every service we advertise is available. Choose a pre-built package or work with our Sales Team to customize your perfect publishing solution.
        </p>
      </motion.section>

      {/* Author Packages */}
      <section>
        <h2 className="text-[24px] font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#C8A55C]" />
          For Authors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {authorPackages.map((pkg, i) => (
            <motion.div key={pkg.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-6 card-hover">
              <div className="flex items-center gap-2 mb-2">
                {pkg.tier === 'creator' && <Sparkles className="w-5 h-5 text-[#C8A55C]" />}
                {pkg.tier === 'professional' && <Star className="w-5 h-5 text-[#C8A55C]" />}
                {pkg.tier === 'publisher' && <Crown className="w-5 h-5 text-[#C8A55C]" />}
                <h3 className="text-[18px] font-semibold">{pkg.name}</h3>
              </div>
              <p className="text-[12px] text-[#C8A55C] mb-3">{pkg.price}</p>
              <p className="text-[13px] text-[#9B9589] mb-4">{pkg.description}</p>
              <ul className="space-y-1.5 mb-5">
                {pkg.services.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-[12px] text-[#F5F0E8]">
                    <Check className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 mt-0.5" />{s}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="w-full block text-center py-2 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium hover:bg-[rgba(245,240,232,0.04)] transition-all">
                Select Plan
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise Packages */}
      <section>
        <h2 className="text-[24px] font-semibold mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#C8A55C]" />
          For Enterprises & Institutions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {enterprisePackages.map((pkg, i) => (
            <motion.div key={pkg.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-6 card-hover border border-[rgba(200,165,92,0.15)]">
              <h3 className="text-[18px] font-semibold mb-1">{pkg.name}</h3>
              <p className="text-[12px] text-[#C8A55C] mb-3">{pkg.price}</p>
              <p className="text-[13px] text-[#9B9589] mb-4">{pkg.description}</p>
              <ul className="space-y-1.5 mb-5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-[#F5F0E8]">
                    <Check className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/help" className="w-full block text-center py-2 rounded-lg bg-[rgba(200,165,92,0.12)] text-[#C8A55C] text-[13px] font-medium hover:bg-[rgba(200,165,92,0.2)] transition-all">
                Contact Sales
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* A La Carte Services */}
      <section>
        <h2 className="text-[24px] font-semibold mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#C8A55C]" />
          Premium AI Services (A La Carte)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {aLaCarte.map((item, i) => (
            <motion.div key={item.service} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 card-hover">
              <h3 className="text-[14px] font-semibold mb-0.5">{item.service}</h3>
              <p className="text-[16px] text-[#C8A55C] font-medium mb-1">{item.price}</p>
              <p className="text-[11px] text-[#9B9589]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-surface p-8 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <h2 className="text-[24px] font-semibold mb-3">Need a Custom Package?</h2>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto mb-6">
          Our Sales Team will work with you to design a package that fits your exact needs. We handle everything from single-author setups to multi-department institutional deployments.
        </p>
        <Link to="/help" className="inline-flex items-center gap-2 btn-gold text-[14px]">
          <ArrowRight className="w-4 h-4" />Talk to Sales
        </Link>
      </section>
    </div>
  )
}
