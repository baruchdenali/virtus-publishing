import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { Star, Search, SlidersHorizontal } from 'lucide-react'

const categories = [
  { value: undefined, label: 'All' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'academic', label: 'Academic' },
  { value: 'other', label: 'Other' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
}

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [sort, setSort] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = trpc.store.list.useQuery({
    category: selectedCategory as any,
    search: searchQuery || undefined,
    sort: sort as any,
    page: 1,
    limit: 24,
  })

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative py-12 rounded-2xl overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1A1A1F 0%, #232328 50%, #2E2E35 100%)' }} />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full border border-[#C8A55C] opacity-20" />
          <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full border border-[#C8A55C] opacity-10" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full border border-[#C8A55C] opacity-15" />
        </div>
        <div className="relative text-center max-w-2xl mx-auto px-6">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase"
          >
            The Virtus Bookstore
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[36px] md:text-[40px] font-semibold leading-[1.2] tracking-[-0.02em] mt-3 mb-4"
          >
            Discover Your Next
            <br />
            <span className="text-gradient-gold">Great Read</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] text-[#9B9589]"
          >
            Professional eBooks crafted by authors worldwide
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[rgba(245,240,232,0.08)] bg-[#1A1A1F]">
          <Search className="w-4 h-4 text-[#9B9589] shrink-0" />
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#C8A55C] text-[#1A1A1F] font-semibold'
                : 'bg-[#232328] text-[#9B9589] border border-[rgba(245,240,232,0.08)] hover:text-[#F5F0E8] hover:border-[rgba(245,240,232,0.14)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort (shown when filters open) */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 pb-2"
        >
          <span className="text-[12px] text-[#9B9589]">Sort by:</span>
          <div className="flex gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  sort === opt.value
                    ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]'
                    : 'text-[#9B9589] hover:text-[#F5F0E8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="text-[13px] text-[#9B9589]">
        {isLoading ? 'Loading...' : `${data?.total ?? 0} eBooks found`}
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-[#232328] mb-3" />
              <div className="h-4 bg-[#232328] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#232328] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.items.map((book, i) => (
            <motion.div
              key={book.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Link to={`/store/${book.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.32)] card-hover">
                  <img
                    src={book.coverImageUrl || `/covers/cover-${(book.id % 6) + 1}.jpg`}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {book.isFree && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7AAE7A] text-white">FREE</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-4 py-2 rounded-lg bg-[rgba(26,26,31,0.85)] text-[12px] font-medium text-[#F5F0E8] backdrop-blur-sm">Quick View</span>
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#F5F0E8] line-clamp-2 leading-tight group-hover:text-[#C8A55C] transition-colors">{book.title}</h3>
                <p className="text-[13px] text-[#9B9589] mt-0.5">{book.authorName || 'Unknown Author'}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < Math.floor(book.rating) ? 'text-[#C8A55C] fill-[#C8A55C]' : 'text-[rgba(245,240,232,0.15)]'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9B9589]">({book.reviewCount})</span>
                </div>
                {book.isFree ? (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#7AAE7A]/20 text-[#7AAE7A]">Free</span>
                ) : (
                  <p className="text-[15px] font-semibold text-[#C8A55C] mt-1">${book.price}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[16px] text-[#9B9589]">No eBooks found matching your criteria.</p>
          <button
            onClick={() => { setSelectedCategory(undefined); setSearchQuery('') }}
            className="mt-4 text-[14px] text-[#C8A55C] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
