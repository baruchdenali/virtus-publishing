import { motion } from 'framer-motion'
import { Mic, Headphones, Play, Radio, Calendar, Clock, Star, Download, Share2, Heart } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const } }),
}

const episodes = [
  {
    id: 42,
    title: 'Building a Writing Habit with Elena Voss',
    description: 'Elena shares her daily writing ritual that helped her publish 12 books in 5 years. Practical tips for consistency and overcoming writer\'s block.',
    duration: '45 min',
    date: 'May 25, 2026',
    plays: 12400,
    featured: true,
    guest: 'Elena Voss',
    guestTitle: 'Bestselling Author, 12 Books Published',
  },
  {
    id: 41,
    title: 'The Future of Digital Publishing',
    description: 'Industry experts discuss where publishing is headed in the next decade. AI, blockchain rights management, and the rise of micro-publishing.',
    duration: '38 min',
    date: 'May 18, 2026',
    plays: 9800,
    featured: false,
    guest: 'Panel Discussion',
    guestTitle: '3 Publishing Industry Leaders',
  },
  {
    id: 40,
    title: 'Marketing Your eBook in 2026',
    description: 'Cutting-edge marketing strategies for the modern author. From social media algorithms to email list building and launch tactics.',
    duration: '52 min',
    date: 'May 11, 2026',
    plays: 15200,
    featured: false,
    guest: 'Marcus Chen',
    guestTitle: 'Marketing Director, Virtus Publishing',
  },
  {
    id: 39,
    title: 'Green Publishing: Zero Paper, Maximum Impact',
    description: 'How digital publishing is saving millions of trees annually. The environmental case for eBooks and carbon-neutral publishing platforms.',
    duration: '41 min',
    date: 'May 4, 2026',
    plays: 8700,
    featured: false,
    guest: 'Dr. Anya Sharma',
    guestTitle: 'Environmental Scientist & Author',
  },
  {
    id: 38,
    title: 'Protecting Your Work: Copyright in the Digital Age',
    description: 'Understanding intellectual property rights for digital authors. Encryption, DRM alternatives, and best practices for manuscript security.',
    duration: '35 min',
    date: 'April 27, 2026',
    plays: 7200,
    featured: false,
    guest: 'James Morrison',
    guestTitle: 'Intellectual Property Attorney',
  },
  {
    id: 37,
    title: 'From Hobby to Career: Making Money Writing',
    description: 'Real revenue strategies for authors. Pricing models, platform selection, and building multiple income streams from your writing.',
    duration: '48 min',
    date: 'April 20, 2026',
    plays: 18900,
    featured: false,
    guest: 'Ava Chen',
    guestTitle: 'Full-Time Author & Entrepreneur',
  },
]

export default function Podcast() {
  const featured = episodes.find((e) => e.featured)
  const rest = episodes.filter((e) => e.id !== featured?.id)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/podcast-1.jpg" alt="Podcast studio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1F] via-[#1A1A1F]/95 to-[#1A1A1F]/70" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative p-8 md:p-12">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-[#C8A55C]" />
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Virtus Podcast</span>
          </div>
          <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-0.03em] mb-3">
            Voices of <span className="text-gradient-gold">Virtus</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#9B9589] max-w-lg mb-8">
            Deep conversations with authors, publishers, and industry innovators. New episodes every Tuesday.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#9B9589]">
            <span className="flex items-center gap-1.5"><Headphones className="w-4 h-4 text-[#C8A55C]" />{episodes.length * 12000}+ total plays</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#C8A55C]" />4.9 rating</span>
            <span className="flex items-center gap-1.5"><Radio className="w-4 h-4 text-[#C8A55C]" />Weekly episodes</span>
          </div>
        </motion.div>
      </section>

      {/* Featured Episode */}
      {featured && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[#C8A55C]" />
            <span className="text-[13px] font-medium text-[#C8A55C]">Latest Episode</span>
          </div>
          <div className="glass-surface p-6 md:p-8 border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.06)' }}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#C8A55C] flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                <Play className="w-7 h-7 md:w-8 md:h-8 text-[#1A1A1F] ml-1" fill="#1A1A1F" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-mono text-[#C8A55C]">EP.{featured.id}</span>
                  <span className="text-[11px] text-[#9B9589]">|</span>
                  <span className="text-[12px] text-[#9B9589]">{featured.date}</span>
                </div>
                <h2 className="text-[22px] md:text-[28px] font-semibold mb-2">{featured.title}</h2>
                <p className="text-[14px] text-[#9B9589] mb-3">{featured.description}</p>
                <p className="text-[13px] text-[#C8A55C] mb-4">Guest: {featured.guest} — {featured.guestTitle}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#9B9589]"><Clock className="w-3.5 h-3.5" />{featured.duration}</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-[#9B9589]"><Headphones className="w-3.5 h-3.5" />{featured.plays.toLocaleString()} plays</span>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                <button className="w-9 h-9 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all"><Heart className="w-4 h-4 text-[#9B9589]" /></button>
                <button className="w-9 h-9 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all"><Download className="w-4 h-4 text-[#9B9589]" /></button>
                <button className="w-9 h-9 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all"><Share2 className="w-4 h-4 text-[#9B9589]" /></button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Episode List */}
      <section>
        <h2 className="text-[24px] font-semibold tracking-[-0.01em] mb-6">All Episodes</h2>
        <div className="space-y-3">
          {rest.map((ep, i) => (
            <motion.div key={ep.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-4 md:p-5 flex items-center gap-4 card-hover group cursor-pointer">
              <button className="w-12 h-12 rounded-full bg-[rgba(200,165,92,0.12)] flex items-center justify-center group-hover:bg-[#C8A55C] transition-all shrink-0">
                <Play className="w-5 h-5 text-[#C8A55C] group-hover:text-[#1A1A1F] ml-0.5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono text-[#C8A55C]">EP.{ep.id}</span>
                  <span className="text-[11px] text-[#9B9589]">{ep.date}</span>
                </div>
                <h3 className="text-[14px] md:text-[15px] font-semibold truncate">{ep.title}</h3>
                <p className="text-[12px] text-[#9B9589] truncate">{ep.guest} — {ep.guestTitle}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <span className="text-[12px] text-[#9B9589] flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ep.duration}</span>
                <span className="text-[12px] text-[#9B9589] flex items-center gap-1"><Headphones className="w-3.5 h-3.5" />{(ep.plays / 1000).toFixed(1)}k</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="glass-surface p-8 md:p-12 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <Radio className="w-8 h-8 text-[#C8A55C] mx-auto mb-4" />
        <h2 className="text-[24px] md:text-[32px] font-semibold mb-3">Never Miss an Episode</h2>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto mb-6">Subscribe to Voices of Virtus and get notified every Tuesday when a new episode drops.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn-gold text-[14px] flex items-center gap-2"><Mic className="w-4 h-4" />Subscribe</button>
          <button className="px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[14px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all flex items-center gap-2"><Download className="w-4 h-4" />RSS Feed</button>
        </div>
      </section>
    </div>
  )
}
