import { useParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { BookOpen, Clock, Tag, ArrowLeft, Loader2, Calendar, User } from 'lucide-react'

export default function KBArticle() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, isLoading } = trpc.kb.bySlug.useQuery({ slug: slug ?? '' }, { enabled: !!slug })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#C8A55C] animate-spin" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-12 h-12 text-[#9B9589] mx-auto mb-4" />
        <h2 className="text-[20px] font-semibold mb-2">Article Not Found</h2>
        <p className="text-[13px] text-[#9B9589] mb-4">The knowledge base article you are looking for does not exist.</p>
        <Link to="/kb" className="btn-gold text-[12px]">Back to Knowledge Base</Link>
      </div>
    )
  }

  // Simple markdown-to-HTML converter (no external dep needed for basic MD)
  const renderMarkdown = (md: string) => {
    let html = md
      // Escape HTML
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-[18px] font-semibold mt-6 mb-3 text-[#C8A55C]">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-[22px] font-semibold mt-8 mb-4 text-[#F5F0E8]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-[28px] font-semibold mt-6 mb-4 text-[#F5F0E8]">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F5F0E8]">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-[#1A1A1F] border border-[rgba(245,240,232,0.06)] rounded-lg p-4 my-4 overflow-x-auto text-[12px] text-[#C8A55C] font-mono leading-relaxed"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-[#1A1A1F] px-1.5 py-0.5 rounded text-[12px] text-[#C8A55C] font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#6B9BD1] hover:text-[#C8A55C] underline underline-offset-2">$1</a>')
      // Unordered lists
      .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-4 text-[13px] text-[#C5BFB3] leading-relaxed relative pl-4 before:content-["•"] before:absolute before:left-0 before:text-[#C8A55C]">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 text-[13px] text-[#C5BFB3] leading-relaxed list-decimal">$1</li>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#C8A55C] pl-4 my-4 text-[13px] text-[#9B9589] italic">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-[rgba(245,240,232,0.06)] my-6" />')
      // Paragraphs (must be last)
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('<'))
      .map(p => `<p class="text-[13px] text-[#C5BFB3] leading-[1.7] mb-4">${p}</p>`)
      .join('\n')

    return html
  }

  return (
    <div className="max-w-[800px] mx-auto pb-16">
      {/* Back link */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Link to="/kb" className="inline-flex items-center gap-1.5 text-[12px] text-[#9B9589] hover:text-[#C8A55C] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Knowledge Base
        </Link>
      </motion.div>

      {/* Article Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(200,165,92,0.1)] text-[#C8A55C]">
            {article.category}
          </span>
          <span className="text-[10px] text-[#9B9589] flex items-center gap-0.5">
            <Clock className="w-3 h-3" />{article.readingTime} min read
          </span>
        </div>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-[11px] text-[#9B9589]">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
        </div>
      </motion.div>

      {/* Tags */}
      {(article.tags ?? []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8 flex-wrap">
          {(article.tags ?? []).map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-[rgba(245,240,232,0.04)] text-[#9B9589] flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </motion.div>
      )}

      {/* Content */}
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-surface p-6 md:p-8"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
      />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-[11px] text-[#9B9589] mb-3">
          Was this article helpful? Need more help? Contact <a href="mailto:publishing@virtus-edu.net" className="text-[#6B9BD1] hover:text-[#C8A55C]">publishing@virtus-edu.net</a>
        </p>
        <Link to="/kb" className="btn-gold text-[12px]">Browse All Articles</Link>
      </motion.div>
    </div>
  )
}
