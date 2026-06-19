import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Check, CreditCard, Shield, Lock, BookOpen, BarChart3, Globe, Zap, Sparkles, Users, Star, Crown, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const tiers = [
  {
    id: 'creator',
    name: 'Virtus Creator',
    price: 29,
    period: '/month',
    description: 'Perfect for independent authors building their catalog.',
    icon: Sparkles,
    features: [
      'AI-Powered eBook Creation',
      'Basic Analytics Dashboard',
      'Standard Distribution',
      'Community Forum Access',
      'Email Support',
      'Up to 10 eBooks',
      'EPUB & PDF Export',
      'Cover Design Templates',
    ],
    cta: 'Start Creating',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Virtus Professional',
    price: 49,
    period: '/month',
    description: 'For serious authors ready to scale their publishing business.',
    icon: Star,
    features: [
      'Everything in Creator',
      'Advanced AI Writing Assistant',
      'Comprehensive Analytics Suite',
      'Priority Distribution Network',
      'Featured Placement Eligibility',
      'Unlimited eBooks',
      'Marketing Toolkit',
      'Audiobook Conversion',
      'Priority Support (24h)',
      'Custom Branding',
    ],
    cta: 'Go Professional',
    popular: true,
  },
  {
    id: 'publisher',
    name: 'Virtus Publisher',
    price: 149,
    period: '/month',
    description: 'The complete publishing powerhouse for maximum reach.',
    icon: Crown,
    features: [
      'Everything in Professional',
      'Premium AI Suite',
      'Full Marketing Automation',
      'Advanced Analytics + Reports',
      'Guaranteed Featured Placement',
      'API Access',
      'Bulk eBook Management',
      'White-Label Distribution',
      'Dedicated Account Manager',
      'Team Collaboration (5 seats)',
      'Custom Integrations',
    ],
    cta: 'Become a Publisher',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Virtus Enterprise',
    price: 0,
    period: '/custom',
    description: 'For institutions, publishers, and large teams. Contact us for pricing.',
    icon: Building2,
    features: [
      'Everything in Publisher',
      'Custom Deployment Options',
      'SSO Integration',
      'Unlimited Team Seats',
      'SLA Guarantee (99.9%)',
      'On-Premise Option',
      'Advanced Security Controls',
      'Custom AI Training',
      'White-Label Platform',
      'Executive Reporting',
      '24/7 Phone Support',
    ],
    cta: 'Contact Sales',
    popular: false,
    custom: true,
  },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
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
          Choose Your <span className="text-gradient-gold">Publishing Path</span>
        </h1>
        <p className="text-[16px] md:text-[18px] text-[#9B9589] max-w-2xl mx-auto">
          From your first manuscript to a global publishing empire. Every plan includes our core AI-powered writing tools, military-grade encryption, and 24/7 platform access.
        </p>
      </motion.section>

      {/* Security badges */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          { icon: Shield, text: 'PCI DSS Level 1 Compliant' },
          { icon: Lock, text: '256-bit SSL Encryption' },
          { icon: CreditCard, text: 'Visa / Mastercard / AmEx / Discover' },
          { icon: Zap, text: 'Instant Account Activation' },
        ].map((badge) => (
          <div key={badge.text} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface">
            <badge.icon className="w-4 h-4 text-[#4ADE80]" />
            <span className="text-[11px] text-[#9B9589]">{badge.text}</span>
          </div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className={`glass-surface p-6 flex flex-col relative ${tier.popular ? 'border border-[rgba(200,165,92,0.3)]' : ''}`}
            style={tier.popular ? { boxShadow: '0 0 30px rgba(200,165,92,0.1)' } : {}}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#C8A55C] text-[#1A1A1F] text-[10px] font-semibold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <tier.icon className="w-5 h-5 text-[#C8A55C]" />
              <h3 className="text-[16px] font-semibold">{tier.name}</h3>
            </div>
            <p className="text-[12px] text-[#9B9589] mb-4 min-h-[36px]">{tier.description}</p>

            <div className="mb-5">
              {tier.custom ? (
                <span className="text-[32px] font-semibold">Custom</span>
              ) : (
                <>
                  <span className="text-[32px] font-semibold tracking-[-0.02em]">${tier.price}</span>
                  <span className="text-[13px] text-[#9B9589]">{tier.period}</span>
                </>
              )}
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[12px] text-[#F5F0E8]">
                  <Check className="w-3.5 h-3.5 text-[#C8A55C] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to={tier.custom ? '/help' : isAuthenticated ? '/dashboard' : '/login'}
              className={`w-full py-2.5 rounded-lg text-center text-[13px] font-medium transition-all ${
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

      {/* Revenue Streams */}
      <section>
        <h2 className="text-[24px] font-semibold text-center mb-8">Additional Revenue Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { icon: BookOpen, title: 'Direct eBook Sales', desc: 'Sell your eBooks directly through our integrated storefront. You keep 80% of every sale. Set your own prices starting from $0.99.', highlight: '80% Author Share' },
            { icon: Zap, title: 'Premium AI Services', desc: 'AI-powered cover generation ($10), chapter writing ($25), professional editing ($50), ISBN registration ($15), and marketing toolkits ($30).', highlight: 'A La Carte Services' },
            { icon: BarChart3, title: 'Featured Placement', desc: 'Boost visibility with featured placement on our homepage ($50/week) or category banners ($100/week). Reach our global audience.', highlight: '50K+ Monthly Readers' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="glass-surface p-5 card-hover"
            >
              <div className="flex items-center gap-2 mb-3">
                <item.icon className="w-5 h-5 text-[#C8A55C]" />
                <h3 className="text-[15px] font-semibold">{item.title}</h3>
              </div>
              <p className="text-[12px] text-[#9B9589] mb-3 leading-relaxed">{item.desc}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C]">{item.highlight}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="glass-surface p-8 md:p-12 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <Building2 className="w-8 h-8 text-[#C8A55C] mx-auto mb-4" />
        <h2 className="text-[24px] md:text-[32px] font-semibold mb-3">Enterprise & Institutional Licensing</h2>
        <p className="text-[14px] text-[#9B9589] max-w-lg mx-auto mb-6">
          Custom solutions for universities, publishing houses, libraries, and corporations. Pricing from $5,000/year. Full white-label options available.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/help" className="btn-gold text-[14px] flex items-center gap-2">
            <Users className="w-4 h-4" />Contact Sales Team
          </Link>
          <Link to="/packages" className="px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[14px] font-medium hover:bg-[rgba(245,240,232,0.04)] transition-all">
            View Custom Packages
          </Link>
        </div>
      </section>
    </div>
  )
}
// Deployed Mon Jun  1 05:18:20 CST 2026
