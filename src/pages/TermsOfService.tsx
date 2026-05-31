import { motion } from 'framer-motion'
import { FileText, Scale, CreditCard, Copyright, Gavel, AlertTriangle } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <Scale className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Legal</span>
        </div>
        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          Terms of <span className="text-gradient-gold">Service</span>
        </h1>
        <p className="text-[14px] text-[#9B9589]">Last Updated: June 1, 2026</p>
      </motion.section>

      <section className="glass-surface p-6 space-y-4 text-[14px] leading-relaxed text-[#9B9589]">
        <p className="text-[#F5F0E8] font-medium">Please read these Terms of Service carefully before using the Virtus Publishing platform. By accessing or using our service, you agree to be bound by these terms.</p>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Virtus Publishing, you agree to these Terms of Service and our Privacy Policy. If you do not agree, you may not use our services. These terms apply to all visitors, users, and others who access or use the service.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">2. Payment Terms</h2>
            <p>We accept Visa, Mastercard, American Express, and Discover credit and debit cards. All payments are processed securely through Stripe. Prices are in USD and do not include applicable taxes. Subscriptions auto-renew unless cancelled. You may cancel at any time through your account settings.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Copyright className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">3. Content Ownership</h2>
            <p>You retain full ownership of all content you create on our platform. You grant Virtus Publishing a limited license to host, display, and distribute your content solely for the purpose of providing our services to you. We do not claim any ownership over your intellectual property.</p>
          </div>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">4. User Accounts</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">5. Acceptable Use</h2>
          <p>You agree not to use our platform to: (a) violate any laws, (b) infringe on intellectual property rights, (c) distribute malware or harmful content, (d) harass or harm others, (e) attempt to breach security, or (f) engage in any activity that disrupts our services.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">6. Refund Policy</h2>
          <p>Premium subscriptions include a 30-day money-back guarantee. To request a refund, contact us within 30 days of purchase. Refunds are processed within 5-10 business days. Individual eBook purchases are non-refundable once downloaded.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">7. Termination</h2>
          <p>We may terminate or suspend your account immediately for any violation of these terms. Upon termination, your right to use the service ceases immediately. You may also delete your account at any time.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Virtus Publishing shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">9. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through the platform. Continued use after changes constitutes acceptance.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">10. Governing Law</h2>
          <p>These terms shall be governed by the laws of the State of New York, without regard to conflict of law provisions.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">11. Contact</h2>
          <p>For questions about these Terms, contact us:</p>
          <p className="mt-2">Email: publishing@virtus-edu.net</p>
          <p>Phone: (202) 984-5787</p>
          <p>Address: Virtus Publishing, New York — Miami — London</p>
        </div>
      </section>
    </div>
  )
}
