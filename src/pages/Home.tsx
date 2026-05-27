import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import {
  Sparkles, BookOpen, Globe, Lock, ArrowRight, Star, TrendingUp, Users,
  Calendar, Mic, Headphones, Newspaper, MapPin, Clock, Radio, Play
} from 'lucide-react'
import Logo from '@/components/Logo'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
}

const featuredBooks = [
  { id: 1, title: "The Art of Publishing", author: "Eleanor Vance", price: "24.99", rating: 4.8, reviews: 124, cover: "/covers/cover-1.jpg", category: "business" },
  { id: 2, title: "TechWave: Navigating the Digital Frontier", author: "Dr. Anya Sharma", price: "29.99", rating: 4.9, reviews: 89, cover: "/covers/cover-2.jpg", category: "technology" },
  { id: 3, title: "The Unbecoming", author: "Ava Chen", price: "0", rating: 4.7, reviews: 256, cover: "/covers/cover-3.jpg", category: "self-help" },
  { id: 4, title: "The Architects of Knowledge", author: "Dr. Elijah Vance", price: "34.99", rating: 4.9, reviews: 67, cover: "/covers/cover-4.jpg", category: "academic" },
  { id: 5, title: "The Unseen Ink", author: "Isabella King", price: "19.99", rating: 4.6, reviews: 178, cover: "/covers/cover-5.jpg", category: "fiction" },
  { id: 6, title: "Cosmic Forge", author: "Dr. Laraine Cox", price: "27.99", rating: 4.8, reviews: 95, cover: "/covers/cover-6.jpg", category: "technology" },
]

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #C8A55C 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, #C8A55C 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C8A55C] animate-pulse" />
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('hero.tagline')}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-[48px] md:text-[64px] font-semibold leading-[1.1] tracking-[-0.03em] mb-6">
            {t('hero.title1')}<br /><span className="text-gradient-gold">{t('hero.title2')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-[16px] md:text-[18px] leading-[1.7] text-[#9B9589] max-w-xl mb-10">
            {t('hero.desc')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4">
            <Link to="/create" className="inline-flex items-center gap-2 btn-gold text-[14px]">
              <Sparkles className="w-4 h-4" />{t('hero.cta.create')}
            </Link>
            <Link to="/store" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[rgba(245,240,232,0.14)] text-[14px] font-medium text-[#F5F0E8] hover:border-[rgba(245,240,232,0.24)] hover:bg-[rgba(245,240,232,0.04)] transition-all">
              {t('hero.cta.browse')}<ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('stats.ebooks'), value: '2,847', icon: BookOpen },
            { label: t('stats.authors'), value: '1,204', icon: Users },
            { label: t('stats.countries'), value: '86', icon: Globe },
            { label: t('stats.rating'), value: '4.8', icon: Star },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-6">
              <stat.icon className="w-5 h-5 text-[#C8A55C] mb-3" />
              <div className="text-[28px] md:text-[32px] font-semibold text-[#F5F0E8] leading-tight">{stat.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9589] mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('featured.tagline')}</span>
            <h2 className="text-[32px] font-semibold tracking-[-0.01em] mt-1">{t('featured.title')}</h2>
          </div>
          <Link to="/store" className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-[#C8A55C] hover:text-[#D9BC7A] transition-colors">
            {t('featured.viewall')}<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredBooks.map((book, i) => (
            <motion.div key={book.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Link to={`/store/${book.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.32)] card-hover">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  {Number(book.price) === 0 && <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7AAE7A] text-white">FREE</span>}
                </div>
                <h3 className="text-[14px] font-semibold text-[#F5F0E8] line-clamp-2 leading-tight group-hover:text-[#C8A55C] transition-colors">{book.title}</h3>
                <p className="text-[12px] text-[#9B9589] mt-0.5">{book.author}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-3 h-3 ${j < Math.floor(book.rating) ? 'text-[#C8A55C] fill-[#C8A55C]' : 'text-[rgba(245,240,232,0.15)]'}`} />)}
                  </div>
                  <span className="text-[11px] text-[#9B9589]">({book.reviews})</span>
                </div>
                {Number(book.price) > 0 && <p className="text-[14px] font-semibold text-[#C8A55C] mt-1">${book.price}</p>}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('features.tagline')}</span>
          <h2 className="text-[32px] font-semibold tracking-[-0.01em] mt-2">{t('features.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: t('features.ai.title'), description: t('features.ai.desc') },
            { icon: TrendingUp, title: t('features.publishing.title'), description: t('features.publishing.desc') },
            { icon: Lock, title: t('features.security.title'), description: t('features.security.desc') },
            { icon: Globe, title: t('features.store.title'), description: t('features.store.desc') },
            { icon: BookOpen, title: t('features.upload.title'), description: t('features.upload.desc') },
            { icon: Users, title: t('features.analytics.title'), description: t('features.analytics.desc') },
          ].map((feature, i) => (
            <motion.div key={feature.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-8 card-hover">
              <div className="w-10 h-10 rounded-lg bg-[rgba(200,165,92,0.12)] flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-[#C8A55C]" />
              </div>
              <h3 className="text-[18px] font-semibold mb-2">{feature.title}</h3>
              <p className="text-[14px] leading-[1.6] text-[#9B9589]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Section - NEW */}
      <section>
        <div className="text-center mb-12">
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('community.tagline')}</span>
          <h2 className="text-[32px] font-semibold tracking-[-0.01em] mt-2">{t('community.title')}</h2>
          <p className="text-[16px] text-[#9B9589] max-w-2xl mx-auto mt-3 leading-relaxed">{t('community.desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl overflow-hidden card-hover">
            <img src="/images/community-1.jpg" alt="Community of authors" className="w-full h-[260px] object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="rounded-xl overflow-hidden card-hover">
            <img src="/images/community-2.jpg" alt="Children reading" className="w-full h-[260px] object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="rounded-xl overflow-hidden card-hover">
            <img src="/images/community-3.jpg" alt="Author working" className="w-full h-[260px] object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="rounded-xl overflow-hidden card-hover">
            <img src="/images/community-4.jpg" alt="Book launch event" className="w-full h-[260px] object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Store Events Section - NEW */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('events.tagline')}</span>
            <h2 className="text-[32px] font-semibold tracking-[-0.01em] mt-1">{t('events.title')}</h2>
            <p className="text-[14px] text-[#9B9589] mt-1">{t('events.desc')}</p>
          </div>
          <Calendar className="w-6 h-6 text-[#C8A55C]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: t('events.event1.title'), date: t('events.event1.date'), desc: t('events.event1.desc'), image: '/images/community-4.jpg' },
            { title: t('events.event2.title'), date: t('events.event2.date'), desc: t('events.event2.desc'), image: '/images/community-1.jpg' },
            { title: t('events.event3.title'), date: t('events.event3.date'), desc: t('events.event3.desc'), image: '/images/community-3.jpg' },
          ].map((event, i) => (
            <motion.div key={event.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface overflow-hidden card-hover">
              <div className="relative h-40">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[rgba(26,26,31,0.85)] backdrop-blur-sm text-[11px] font-medium text-[#C8A55C] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />{event.date}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-semibold mb-2">{event.title}</h3>
                <p className="text-[13px] text-[#9B9589] leading-relaxed mb-4">{event.desc}</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[rgba(200,165,92,0.12)] text-[#C8A55C] hover:bg-[rgba(200,165,92,0.2)] transition-all">
                  <MapPin className="w-3.5 h-3.5" />{t('events.rsvp')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="inline-flex items-center gap-2 text-[13px] font-medium text-[#9B9589] hover:text-[#C8A55C] transition-colors">
            <Clock className="w-4 h-4" />{t('events.past')}
          </button>
        </div>
      </section>

      {/* Virtus Reads Blog Section - NEW */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('blog.tagline')}</span>
            <h2 className="text-[32px] font-semibold tracking-[-0.01em] mt-1">{t('blog.title')}</h2>
            <p className="text-[14px] text-[#9B9589] mt-1">{t('blog.desc')}</p>
          </div>
          <Newspaper className="w-6 h-6 text-[#C8A55C]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: t('blog.post1.title'), date: t('blog.post1.date'), category: t('blog.post1.category'), image: '/images/blog-1.jpg' },
            { title: t('blog.post2.title'), date: t('blog.post2.date'), category: t('blog.post2.category'), image: '/images/community-3.jpg' },
            { title: t('blog.post3.title'), date: t('blog.post3.date'), category: t('blog.post3.category'), image: '/images/community-1.jpg' },
          ].map((post, i) => (
            <motion.div key={post.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Link to="#" className="group block glass-surface overflow-hidden card-hover">
                <div className="relative h-44">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.15)] text-[#C8A55C] uppercase">{post.category}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11px] text-[#9B9589] mb-2">
                    <Calendar className="w-3 h-3" />{post.date}
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug group-hover:text-[#C8A55C] transition-colors">{post.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Virtus Podcast Section - NEW */}
      <section>
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0">
            <img src="/images/podcast-1.jpg" alt="Podcast studio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1F] via-[#1A1A1F]/95 to-[#1A1A1F]/70" />
          </div>
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-[#C8A55C]" />
              <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">{t('podcast.tagline')}</span>
            </div>
            <h2 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.02em] mb-3">{t('podcast.title')}</h2>
            <p className="text-[16px] text-[#9B9589] max-w-lg mb-8">{t('podcast.desc')}</p>

            <div className="space-y-3 max-w-xl">
              {[
                { title: t('podcast.ep1.title'), duration: t('podcast.ep1.duration'), num: '42' },
                { title: t('podcast.ep2.title'), duration: t('podcast.ep2.duration'), num: '41' },
                { title: t('podcast.ep3.title'), duration: t('podcast.ep3.duration'), num: '40' },
              ].map((ep) => (
                <div key={ep.num} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(245,240,232,0.04)] border border-[rgba(245,240,232,0.06)] hover:bg-[rgba(245,240,232,0.06)] transition-all group cursor-pointer">
                  <button className="w-10 h-10 rounded-full bg-[rgba(200,165,92,0.15)] flex items-center justify-center group-hover:bg-[#C8A55C] transition-all shrink-0">
                    <Play className="w-4 h-4 text-[#C8A55C] group-hover:text-[#1A1A1F] ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-medium truncate">{ep.title}</h4>
                    <span className="text-[11px] text-[#9B9589] flex items-center gap-1">
                      <Headphones className="w-3 h-3" />{ep.duration}
                    </span>
                  </div>
                  <Radio className="w-4 h-4 text-[#9B9589] shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button className="inline-flex items-center gap-2 btn-gold text-[13px]">
                <Mic className="w-4 h-4" />{t('podcast.listen')}
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
                <Radio className="w-4 h-4" />{t('podcast.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(200,165,92,0.08) 0%, rgba(26,26,31,0) 50%, rgba(200,165,92,0.05) 100%)' }} />
        <div className="relative glass-surface p-12 md:p-16 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08), 0 4px 16px rgba(0,0,0,0.32)' }}>
          <h2 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.02em] mb-4">
            {t('cta.title1')}<br /><span className="text-gradient-gold">{t('cta.title2')}</span>
          </h2>
          <p className="text-[16px] text-[#9B9589] max-w-lg mx-auto mb-8">{t('cta.desc')}</p>
          <Link to="/create" className="inline-flex items-center gap-2 btn-gold text-[14px] px-8 py-3.5">
            <Sparkles className="w-4 h-4" />{t('cta.button')}
          </Link>
        </div>
      </section>

      {/* Spacer before AppShell footer */}
      <div className="h-8" />
    </div>
  )
}
