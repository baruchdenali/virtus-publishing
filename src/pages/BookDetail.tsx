import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Star, Download, ShoppingCart, BookOpen, Calendar, Globe, FileText, ArrowLeft, Tag } from 'lucide-react'
import { useState } from 'react'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const bookId = Number(id)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const { data: book, isLoading } = trpc.store.getById.useQuery({ id: bookId })
  const { data: reviews } = trpc.review.list.useQuery({ ebookId: bookId })
  const { data: ownership } = trpc.purchase.checkOwnership.useQuery(
    { ebookId: bookId },
    { enabled: isAuthenticated }
  )

  const purchaseMutation = trpc.purchase.create.useMutation({
    onSuccess: () => setPurchaseSuccess(true),
  })

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[300px] aspect-[2/3] bg-[#232328] rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-[#232328] rounded w-3/4" />
            <div className="h-4 bg-[#232328] rounded w-1/2" />
            <div className="h-4 bg-[#232328] rounded w-full" />
            <div className="h-4 bg-[#232328] rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-[#9B9589] mx-auto mb-4" />
        <h2 className="text-[20px] font-semibold mb-2">Book Not Found</h2>
        <p className="text-[14px] text-[#9B9589] mb-6">This eBook doesn&apos;t exist or isn&apos;t available.</p>
        <button onClick={() => navigate('/store')} className="btn-gold text-[13px]">Back to Store</button>
      </div>
    )
  }

  const canDownload = ownership?.owned || book.isFree
  const hasPurchased = purchaseSuccess || ownership?.owned

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/store')}
        className="inline-flex items-center gap-2 text-[13px] text-[#9B9589] hover:text-[#F5F0E8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </button>

      {/* Book Detail */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[320px] shrink-0"
        >
          <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.40)]">
            <img
              src={book.coverImageUrl || `/covers/cover-${(book.id % 6) + 1}.jpg`}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] uppercase tracking-wider">
              {book.category}
            </span>
            {book.isFree && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#7AAE7A]/20 text-[#7AAE7A]">Free</span>
            )}
          </div>

          <h1 className="text-[32px] md:text-[40px] font-semibold leading-[1.2] tracking-[-0.02em] mb-2">{book.title}</h1>
          <p className="text-[16px] text-[#9B9589] mb-4">by {book.authorName || 'Unknown Author'}</p>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`w-4 h-4 ${j < Math.floor(book.rating) ? 'text-[#C8A55C] fill-[#C8A55C]' : 'text-[rgba(245,240,232,0.15)]'}`} />
              ))}
            </div>
            <span className="text-[14px] text-[#F5F0E8] font-medium">{book.rating.toFixed(1)}</span>
            <span className="text-[13px] text-[#9B9589]">({book.reviewCount} reviews)</span>
          </div>

          {book.isFree ? (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[28px] font-semibold text-[#7AAE7A]">Free</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[28px] font-semibold text-[#C8A55C]">${book.price}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {canDownload || hasPurchased ? (
              <button className="inline-flex items-center gap-2 btn-gold text-[14px] px-8">
                <Download className="w-4 h-4" />
                Download eBook
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login')
                    return
                  }
                  purchaseMutation.mutate({
                    ebookId: book.id,
                    amount: String(book.price),
                    currency: book.currency || 'USD',
                  })
                }}
                disabled={purchaseMutation.isPending}
                className="inline-flex items-center gap-2 btn-gold text-[14px] px-8 disabled:opacity-60"
              >
                <ShoppingCart className="w-4 h-4" />
                {purchaseMutation.isPending ? 'Processing...' : `Buy Now $${book.price}`}
              </button>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <div className="mb-8">
              <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#9B9589] mb-2">Description</h3>
              <p className="text-[15px] leading-[1.7] text-[#F5F0E8]">{book.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: 'Category', value: book.category || 'N/A' },
              { icon: FileText, label: 'Pages', value: book.pageCount ? String(book.pageCount) : 'N/A' },
              { icon: Globe, label: 'Language', value: book.language || 'English' },
              { icon: Calendar, label: 'Published', value: book.publishedAt ? new Date(book.publishedAt).toLocaleDateString() : 'N/A' },
            ].map((meta) => (
              <div key={meta.label} className="glass-surface p-4">
                <meta.icon className="w-4 h-4 text-[#C8A55C] mb-2" />
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#9B9589]">{meta.label}</div>
                <div className="text-[13px] font-medium text-[#F5F0E8] mt-0.5 capitalize">{meta.value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {book.tags && Array.isArray(book.tags) && book.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#9B9589] mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium bg-[#232328] text-[#9B9589] border border-[rgba(245,240,232,0.08)]">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section>
        <h2 className="text-[24px] font-semibold mb-6">Reader Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-surface p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#2E2E35] flex items-center justify-center text-[12px] font-semibold text-[#F5F0E8]">
                    {(review.userName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">{review.userName || 'Anonymous'}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-[#C8A55C] fill-[#C8A55C]' : 'text-[rgba(245,240,232,0.15)]'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-[11px] text-[#9B9589]">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {review.comment && <p className="text-[14px] leading-[1.6] text-[#F5F0E8]">{review.comment}</p>}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-surface p-8 text-center">
            <p className="text-[14px] text-[#9B9589]">No reviews yet. Be the first to review this eBook!</p>
          </div>
        )}
      </section>
    </div>
  )
}
