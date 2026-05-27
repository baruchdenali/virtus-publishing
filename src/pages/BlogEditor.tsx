import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Newspaper, Save, Eye, ArrowLeft, Plus, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react'

export default function BlogEditor() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const utils = trpc.useUtils()

  const { data: posts, isLoading } = trpc.blog.list.useQuery({ publishedOnly: false })

  const [editing, setEditing] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('General')
  const [image, setImage] = useState('')
  const [readTime, setReadTime] = useState('5 min read')
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate()
      resetForm()
    },
  })

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate()
      resetForm()
    },
  })

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => utils.blog.list.invalidate(),
  })

  const toggleMutation = trpc.blog.togglePublish.useMutation({
    onSuccess: () => utils.blog.list.invalidate(),
  })

  function resetForm() {
    setEditing(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setAuthor(user?.name || '')
    setCategory('General')
    setImage('')
    setReadTime('5 min read')
    setPublished(false)
    setFeatured(false)
  }

  function startEdit(post: any) {
    setEditing(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt || '')
    setContent(post.content)
    setAuthor(post.author || '')
    setCategory(post.category || 'General')
    setImage(post.image || '')
    setReadTime(post.readTime || '5 min read')
    setPublished(post.published)
    setFeatured(post.featured)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSave() {
    if (!title.trim() || !content.trim()) return
    if (editing) {
      updateMutation.mutate({
        id: editing, title, slug, excerpt, content, author, category, image, readTime, published, featured,
      })
    } else {
      createMutation.mutate({
        title, slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        excerpt, content, author, category, image, published, featured, readTime,
      })
    }
  }

  const categories = ['General', 'Technology', 'Author Stories', 'Design', 'Sustainability', 'Marketing', 'Security', 'Publishing Tips']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate('/admin')} className="text-[#9B9589] hover:text-[#C8A55C] transition-colors flex items-center gap-1 text-[13px]">
              <ArrowLeft className="w-4 h-4" />Back to Admin
            </button>
          </div>
          <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Blog Editor</h1>
          <p className="text-[14px] text-[#9B9589]">Write, edit, and publish blog posts.</p>
        </div>
        <button onClick={resetForm} className="btn-gold text-[13px] flex items-center gap-2">
          <Plus className="w-4 h-4" />New Post
        </button>
      </div>

      {/* Editor Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-surface p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field text-[14px]" placeholder="Post title" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="field text-[14px]" placeholder="url-friendly-slug" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Author</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="field text-[14px]" placeholder="Author name" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="field text-[14px]">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Read Time</label>
            <input value={readTime} onChange={(e) => setReadTime(e.target.value)} className="field text-[14px]" placeholder="5 min read" />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Image URL</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} className="field text-[14px]" placeholder="/images/blog-1.jpg" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="field text-[14px] h-16 resize-none" placeholder="Short description for preview cards" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Content (Markdown) *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="field text-[14px] h-64 font-mono leading-relaxed resize-y" placeholder="# Write your blog post here&#10;&#10;Use **markdown** formatting..." />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 accent-[#C8A55C]" />
            <span className="text-[13px]">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-[#C8A55C]" />
            <span className="text-[13px]">Featured</span>
          </label>
          <div className="flex-1" />
          <button onClick={handleSave} disabled={!title.trim() || !content.trim() || createMutation.isPending || updateMutation.isPending}
            className="btn-gold text-[13px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            {editing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </motion.div>

      {/* Posts List */}
      <div>
        <h2 className="text-[20px] font-semibold mb-4">All Posts ({posts?.length || 0})</h2>
        {isLoading ? (
          <p className="text-[14px] text-[#9B9589]">Loading posts...</p>
        ) : (
          <div className="space-y-2">
            {posts?.map((post: any) => (
              <div key={post.id} className="glass-surface p-4 flex items-center gap-4 card-hover">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${post.published ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    {post.featured && <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-[rgba(200,165,92,0.12)] text-[#C8A55C]">Featured</span>}
                    <span className="text-[11px] text-[#9B9589]">{post.category}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold truncate">{post.title}</h3>
                  <p className="text-[12px] text-[#9B9589]">By {post.author} | {post.readTime}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(post)} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all">
                    <Edit3 className="w-3.5 h-3.5 text-[#9B9589]" />
                  </button>
                  <button onClick={() => toggleMutation.mutate({ id: post.id })} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all"
                    title={post.published ? 'Unpublish' : 'Publish'}>
                    {post.published ? <XCircle className="w-3.5 h-3.5 text-[#EF4444]" /> : <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" />}
                  </button>
                  <button onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate({ id: post.id }) }} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.15)] transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))}
            {(!posts || posts.length === 0) && <p className="text-[14px] text-[#9B9589] text-center py-8">No posts yet. Create your first blog post above.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
