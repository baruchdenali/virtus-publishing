import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server, Globe, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <Shield className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Legal</span>
        </div>
        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          Privacy <span className="text-gradient-gold">Policy</span>
        </h1>
        <p className="text-[14px] text-[#9B9589]">Last Updated: June 1, 2026</p>
      </motion.section>

      <section className="glass-surface p-6 space-y-4 text-[14px] leading-relaxed text-[#9B9589]">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, password (encrypted), profile information, and content you create or upload to our platform. We also collect usage data to improve our services.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">2. How We Protect Your Data</h2>
            <p>All data is encrypted using AES-256 encryption both in transit and at rest. Passwords are hashed using bcrypt with a salt factor of 12. We use industry-standard SSL/TLS protocols for all communications. Our infrastructure is hosted on secure cloud providers with SOC 2 Type II compliance.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">3. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our services; process transactions; communicate with you about your account; and provide customer support. We do not sell your personal information to third parties.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">4. Data Sharing</h2>
            <p>We do not share your personal information except: (a) with your consent, (b) to comply with legal obligations, (c) to protect our rights and safety, or (d) with service providers who assist our operations under strict confidentiality agreements.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also request a copy of your data or object to certain processing. Contact us at publishing@virtus-edu.net to exercise these rights.</p>
          </div>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">7. Data Retention</h2>
          <p>We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">8. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect information from children under 13.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the platform.</p>
        </div>

        <div>
          <h2 className="text-[16px] font-semibold text-[#F5F0E8] mb-2">10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <p className="mt-2">Email: publishing@virtus-edu.net</p>
          <p>Phone: (202) 984-5787</p>
          <p>Address: Virtus Publishing, New York — Miami — London</p>
        </div>
      </section>
    </div>
  )
}
