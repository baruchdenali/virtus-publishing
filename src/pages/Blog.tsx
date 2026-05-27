import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Clock, User, Tag, BookOpen, TrendingUp } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const } }),
}

const posts = [
  {
    id: 1,
    title: 'How AI is Revolutionizing the Writing Process',
    excerpt: 'From generating outlines to polishing prose, artificial intelligence is transforming how authors approach their craft. Discover the tools that are changing publishing forever.',
    date: 'May 20, 2026',
    readTime: '8 min read',
    author: 'Elena Voss',
    category: 'Technology',
    image: '/images/blog-1.jpg',
    featured: true,
  },
  {
    id: 2,
    title: 'Interview: From First Draft to Bestseller',
    excerpt: 'We sat down with three Virtus authors who went from unpublished writers to bestselling status in under a year. Their journeys will inspire you.',
    date: 'May 15, 2026',
    readTime: '12 min read',
    author: 'Marcus Chen',
    category: 'Author Stories',
    image: '/images/community-3.jpg',
    featured: false,
  },
  {
    id: 3,
    title: 'The Art of Book Cover Design',
    excerpt: 'Your cover is your first impression. Learn the principles of compelling cover design that sells, from typography to color psychology.',
    date: 'May 10, 2026',
    readTime: '6 min read',
    author: 'Isabella King',
    category: 'Design',
    image: '/images/community-1.jpg',
    featured: false,
  },
  {
    id: 4,
    title: 'Zero-Waste Publishing: The Green Revolution',
    excerpt: 'Digital publishing eliminates printing, shipping, and waste. Learn how Virtus is leading the charge toward carbon-neutral book creation.',
    date: 'May 5, 2026',
    readTime: '5 min read',
    author: 'Dr. Anya Sharma',
    category: 'Sustainability',
    image: '/images/community-2.jpg',
    featured: false,
  },
  {
    id: 5,
    title: 'Building Your Author Brand in 2026',
    excerpt: 'A comprehensive guide to establishing your identity as an author, from social media strategy to reader community building.',
    date: 'April 28, 2026',
    readTime: '10 min read',
    author: 'Baruch Denali',
    category: 'Marketing',
    image: '/images/podcast-1.jpg',
    featured: false,
  },
  {
    id: 6,
    title: 'Military-Grade Security for Your Manuscripts',
    excerpt: 'Why AES-256 encryption matters for authors. Protecting your intellectual property in an age of digital threats.',
    date: 'April 20, 2026',
    readTime: '7 min read',
    author: 'Dr. Elijah Vance',
    category: 'Security',
    image: '/images/community-1.jpg',
    featured: false,
  },
]

export default function Blog() {
  const featured = posts.find((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(200,165,92,0.2)] bg-[rgba(200,165,92,0.08)] mb-6">
          <BookOpen className="w-4 h-4 text-[#C8A55C]" />
          <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Virtus Reads</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-[-0.03em] mb-4">
          From the <span className="text-gradient-gold">Blog</span>
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.7] text-[#9B9589] max-w-xl">
          Publishing tips, author interviews, industry insights, and the latest news from the world of digital books.
        </p>
      </motion.section>

      {/* Featured Post */}
      {featured && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Link to="#" className="group block glass-surface overflow-hidden card-hover">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-56 md:h-auto">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] uppercase mb-3 self-start">
                  <TrendingUp className="w-3 h-3" />Featured
                </span>
                <h2 className="text-[22px] md:text-[28px] font-semibold leading-tight mb-3 group-hover:text-[#C8A55C] transition-colors">{featured.title}</h2>
                <p className="text-[14px] text-[#9B9589] mb-4">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#9B9589]">
                  <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#C8A55C]" />{featured.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#C8A55C]" />{featured.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#C8A55C]" />{featured.readTime}</span>
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-[#C8A55C]" />{featured.category}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      )}

      {/* Post Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((post, i) => (
            <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <Link to="#" className="group block glass-surface overflow-hidden card-hover h-full">
                <div className="relative h-40">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.15)] text-[#C8A55C] uppercase">{post.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold leading-snug mb-2 group-hover:text-[#C8A55C] transition-colors">{post.title}</h3>
                  <p className="text-[13px] text-[#9B9589] mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#9B9589]">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
