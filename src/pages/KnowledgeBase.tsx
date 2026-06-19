import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { BookOpen, Search, Tag, Clock, ArrowRight, Loader2, FolderOpen } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const { data: articles, isLoading } = trpc.kb.list.useQuery()
  const { data: categories } = trpc.kb.categories.useQuery()
  const { data: searchResults } = trpc.kb.search.useQuery(
    { q: searchQuery },
    { enabled: searchQuery.trim().length > 0 }
  )

  const displayArticles = searchQuery.trim() ? (searchResults ?? []) : (articles ?? [])
  const filteredByCategory = activeCategory === 'all'
    ? displayArticles
    : displayArticles.filter((a: any) => a.category === activeCategory)

  return (
    <div className="max-w-[1000px] mx-auto pb-16">
      {/* Header */}
      <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-10">
        <BookOpen className="w-10 h-10 text-[#C8A55C] mx-auto mb-3" />
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] mb-2">Knowledge Base</h1>
        <p className="text-[14px] text-[#9B9589] max-w-md mx-auto">
          Zero-cost documentation powered by markdown. Auto-indexed, searchable, and cached.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div custom={1} variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9589]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles, tags, categories..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#232328] border border-[rgba(245,240,232,0.08)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9589] hover:text-[#F5F0E8] text-[11px]"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && searchResults && (
          <p className="text-center text-[11px] text-[#9B9589] mt-2">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </motion.div>

      {/* Categories */}
      <motion.div custom={2} variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
            activeCategory === 'all' ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589] hover:text-[#F5F0E8]'
          }`}
        >
          All
        </button>
        {(categories ?? []).map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
              activeCategory === cat ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]' : 'bg-[rgba(245,240,232,0.04)] text-[#9B9589] hover:text-[#F5F0E8]'
            }`}
          >
            <FolderOpen className="w-3 h-3" />{cat}
          </button>
        ))}
      </motion.div>

      {/* Articles */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#C8A55C] animate-spin" /></div>
      ) : filteredByCategory.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-[#9B9589] mx-auto mb-3" />
          <p className="text-[14px] text-[#9B9589]">
            {searchQuery ? 'No articles match your search.' : 'No articles yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredByCategory.map((article: any, i: number) => (
            <motion.div
              key={article.slug}
              custom={i + 3}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link
                to={`/kb/${article.slug}`}
                className="block glass-surface p-5 card-hover h-full group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(200,165,92,0.1)] text-[#C8A55C]">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-[#9B9589] flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />{article.readingTime}m
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold mb-1.5 group-hover:text-[#C8A55C] transition-colors">
                  {article.title}
                </h3>
                <p className="text-[12px] text-[#9B9589] leading-relaxed mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {(article.tags ?? []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[9px] text-[#9B9589] flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#9B9589] group-hover:text-[#C8A55C] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
