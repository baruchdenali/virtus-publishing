import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Check, CreditCard, Shield, Zap, BookOpen, BarChart3, Globe, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const tiers = [
  {
    id: 'starter',
    name: 'Virtus Starter',
    price: 9.99,
    period: '/month',
    description: 'Perfect for new authors getting started with digital publishing.',
    features: [
      'Create up to 3 eBooks',
      'AI Writing Assistant',
      'Basic Analytics Dashboard',
      'Community Access',
      'Standard Support',
      'EPUB & PDF Export',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Virtus Professional',
    price: 29.99,
    period: '/month',
    description: 'For serious authors who want unlimited publishing power.',
    features: [
      'Unlimited eBooks',
      'Advanced AI Assistant',
      'Full Analytics Suite',
      'Priority Support',
      'Marketing Tools',
      'Custom Cover Design',
      'Audiobook Generation',
      'Multi-language Publishing',
    ],
    cta: 'Go Professional',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Virtus Enterprise',
    price: 99.99,
    period: '/month',
    description: 'For institutions, publishers, and teams demanding the best.',
    features: [
      'Everything in Professional',
      'Custom Branding',
      'API Access',
      'Team Collaboration (up to 10)',
      'Dedicated Account Manager',
      'White-label Options',
      'Advanced Security Controls',
      'Custom Integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
}

export default function Pricing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <CreditCard className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Pricing</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          Invest in Your <span className="text-gradient-gold">Publishing</span>
        </h1>
        <p className="text-[16px] md:text-[18px] text-[#9B9589] max-w-xl mx-auto">
          Choose the plan that fits your publishing ambitions. All plans include our core AI-powered writing tools.
        </p>
      </motion.section>

      {/* Payment badges */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface">
          <Shield className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-[12px] text-[#9B9589]">PCI DSS Level 1</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface">
          <Lock className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-[12px] text-[#9B9589]">256-bit SSL</span>
        </div>
        <div className="px-4 py-2 rounded-lg glass-surface flex items-center gap-1.5 text-[12px] text-[#9B9589]">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-60" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3 opacity-60" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="AmEx" className="h-3 opacity-60" />
          <span>Accepted</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className={`glass-surface p-6 md:p-8 flex flex-col relative ${tier.popular ? 'border border-[rgba(200,165,92,0.3)]' : ''}`}
            style={tier.popular ? { boxShadow: '0 0 30px rgba(200,165,92,0.1)' } : {}}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#C8A55C] text-[#1A1A1F] text-[10px] font-semibold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <h3 className="text-[20px] font-semibold mb-1">{tier.name}</h3>
            <p className="text-[13px] text-[#9B9589] mb-4">{tier.description}</p>

            <div className="mb-6">
              <span className="text-[36px] font-semibold tracking-[-0.02em]">${tier.price}</span>
              <span className="text-[14px] text-[#9B9589]">{tier.period}</span>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[13px] text-[#F5F0E8]">
                  <Check className="w-4 h-4 text-[#C8A55C] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className={`w-full py-3 rounded-lg text-center text-[14px] font-medium transition-all ${
                tier.popular
                  ? 'btn-gold'
                  : 'border border-[rgba(245,240,232,0.14)] hover:bg-[rgba(245,240,232,0.04)]'
              }`}
            >
              {tier.cta}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Features Grid */}
      <section>
        <h2 className="text-[24px] font-semibold text-center mb-8">All Plans Include</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: 'eBook Publishing', desc: 'Professional formatting' },
            { icon: Zap, label: 'AI Assistant', desc: 'Powered writing tools' },
            { icon: BarChart3, label: 'Analytics', desc: 'Track your success' },
            { icon: Globe, label: 'Global Reach', desc: '86 countries served' },
            { icon: Lock, label: 'Encryption', desc: 'Military-grade security' },
            { icon: Shield, label: 'SSL Protection', desc: 'Secure data transfer' },
            { icon: CreditCard, label: 'Stripe Payments', desc: 'PCI compliant' },
            { icon: BookOpen, label: 'Multi-format', desc: 'EPUB, PDF, Markdown' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="glass-surface p-4 text-center card-hover"
            >
              <item.icon className="w-6 h-6 text-[#C8A55C] mx-auto mb-2" />
              <div className="text-[13px] font-medium">{item.label}</div>
              <div className="text-[11px] text-[#9B9589]">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-surface p-8 md:p-12 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <h2 className="text-[24px] md:text-[32px] font-semibold mb-3">Not Sure Which Plan?</h2>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto mb-6">
          Start with the Starter plan and upgrade anytime. No long-term contracts. Cancel whenever you want.
        </p>
        <Link to="/help" className="inline-flex items-center gap-2 btn-gold text-[14px]">
          <Zap className="w-4 h-4" />Contact Support
        </Link>
      </section>
    </div>
  )
}
