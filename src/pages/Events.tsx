import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, ArrowRight, Users, Star, Sparkles } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const } }),
}

const events = [
  {
    id: 1,
    title: 'Annual Authors Gala 2026',
    date: 'June 15, 2026',
    time: '6:00 PM - 10:00 PM EST',
    location: 'New York, NY — Remote attendance available',
    desc: 'A night celebrating excellence in self-publishing. Awards, networking, and keynote speakers from the industry. Join the most elite gathering of authors and publishers.',
    type: 'Gala',
    attendees: 500,
    image: '/images/community-1.jpg',
    featured: true,
  },
  {
    id: 2,
    title: 'Summer Writing Workshop',
    date: 'July 8-10, 2026',
    time: '9:00 AM - 5:00 PM EST',
    location: 'Miami, FL — Remote attendance available',
    desc: 'Three-day intensive workshop covering plot development, character building, and AI-assisted writing techniques. Hands-on sessions with award-winning authors.',
    type: 'Workshop',
    attendees: 120,
    image: '/images/community-2.jpg',
    featured: true,
  },
  {
    id: 3,
    title: 'Book Launch: The Architects of Knowledge',
    date: 'August 2, 2026',
    time: '7:00 PM - 9:00 PM GMT',
    location: 'London, UK — Remote attendance available',
    desc: 'Exclusive launch event featuring Dr. Elijah Vance discussing the foundations of Western thought and modern academia. Q&A and book signing.',
    type: 'Launch',
    attendees: 300,
    image: '/images/community-3.jpg',
    featured: true,
  },
  {
    id: 4,
    title: 'AI & Publishing: The Future Summit',
    date: 'September 12, 2026',
    time: '10:00 AM - 4:00 PM EST',
    location: 'Remote — Global attendance',
    desc: 'Exploring how artificial intelligence is reshaping the publishing industry. Panel discussions with tech innovators and traditional publishers.',
    type: 'Summit',
    attendees: 2000,
    image: '/images/blog-1.jpg',
    featured: false,
  },
  {
    id: 5,
    title: 'Green Publishing Conference',
    date: 'October 5, 2026',
    time: '9:00 AM - 6:00 PM EST',
    location: 'New York, NY — Remote attendance available',
    desc: 'Dedicated to sustainable, carbon-neutral publishing. Learn how digital publishing reduces environmental impact while maximizing reach.',
    type: 'Conference',
    attendees: 800,
    image: '/images/podcast-1.jpg',
    featured: false,
  },
  {
    id: 6,
    title: 'Holiday Authors Meetup',
    date: 'December 10, 2026',
    time: '5:00 PM - 8:00 PM EST',
    location: 'Remote — Global attendance',
    desc: 'End-of-year celebration for the Virtus community. Share your publishing wins, network with fellow authors, and get a sneak peek at 2027 platform features.',
    type: 'Meetup',
    attendees: 1000,
    image: '/images/community-2.jpg',
    featured: false,
  },
]

export default function Events() {
  const { t } = useLanguage()
  const featuredEvents = events.filter((e) => e.featured)
  const upcomingEvents = events.filter((e) => !e.featured)

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <Calendar className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Store Events</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          Upcoming <span className="text-gradient-gold">Events</span>
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.7] text-[#9B9589] max-w-xl">
          Join book launches, author meetups, writing workshops, and literary festivals hosted by the Virtus community.
        </p>
      </motion.section>

      {/* Featured Events */}
      <section>
        <h2 className="text-[24px] font-semibold tracking-[-0.01em] mb-6">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredEvents.map((event, i) => (
            <motion.div key={event.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface overflow-hidden card-hover">
              <div className="relative h-40">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.2)] text-[#C8A55C] uppercase">{event.type}</span>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-semibold mb-2">{event.title}</h3>
                <p className="text-[13px] text-[#9B9589] mb-3 line-clamp-2">{event.desc}</p>
                <div className="space-y-1.5 text-[12px] text-[#9B9589]">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#C8A55C]" />{event.date}</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#C8A55C]" />{event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#C8A55C]" />{event.location}</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[11px] text-[#9B9589] flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees} attending</span>
                  <button className="px-4 py-1.5 rounded-lg bg-[rgba(200,165,92,0.12)] text-[#C8A55C] text-[12px] font-medium hover:bg-[rgba(200,165,92,0.2)] transition-all">
                    RSVP
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-[24px] font-semibold tracking-[-0.01em] mb-6">More Upcoming</h2>
        <div className="space-y-4">
          {upcomingEvents.map((event, i) => (
            <motion.div key={event.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-surface p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start card-hover">
              <div className="w-full md:w-48 h-28 rounded-xl overflow-hidden shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] uppercase">{event.type}</span>
                  <span className="text-[11px] text-[#9B9589] flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees}</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-2">{event.title}</h3>
                <p className="text-[13px] text-[#9B9589] mb-3">{event.desc}</p>
                <div className="flex flex-wrap gap-3 text-[12px] text-[#9B9589]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#C8A55C]" />{event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#C8A55C]" />{event.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#C8A55C]" />{event.location}</span>
                </div>
              </div>
              <button className="shrink-0 px-5 py-2 rounded-lg bg-[rgba(200,165,92,0.12)] text-[#C8A55C] text-[13px] font-medium hover:bg-[rgba(200,165,92,0.2)] transition-all">
                RSVP
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-surface p-8 md:p-12 text-center border border-[rgba(200,165,92,0.15)]" style={{ boxShadow: '0 0 30px rgba(200,165,92,0.08)' }}>
        <Sparkles className="w-8 h-8 text-[#C8A55C] mx-auto mb-4" />
        <h2 className="text-[24px] md:text-[32px] font-semibold mb-3">Host Your Own Event</h2>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto mb-6">Want to host a book launch, workshop, or meetup through Virtus? Apply to host an event and reach our global community.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 btn-gold text-[14px]">
          <Star className="w-4 h-4" />Apply to Host
        </Link>
      </section>
    </div>
  )
}
