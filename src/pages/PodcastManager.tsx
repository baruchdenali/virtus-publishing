import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Mic, Save, ArrowLeft, Plus, Trash2, Edit3, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function PodcastManager() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const utils = trpc.useUtils()

  const { data: episodes, isLoading } = trpc.podcast.list.useQuery({ publishedOnly: false })

  const [editing, setEditing] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [guest, setGuest] = useState('')
  const [guestTitle, setGuestTitle] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [duration, setDuration] = useState('30 min')
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [date, setDate] = useState('')
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  const createMutation = trpc.podcast.create.useMutation({
    onSuccess: () => { utils.podcast.list.invalidate(); resetForm() },
  })
  const updateMutation = trpc.podcast.update.useMutation({
    onSuccess: () => { utils.podcast.list.invalidate(); resetForm() },
  })
  const deleteMutation = trpc.podcast.delete.useMutation({
    onSuccess: () => utils.podcast.list.invalidate(),
  })
  const toggleMutation = trpc.podcast.togglePublish.useMutation({
    onSuccess: () => utils.podcast.list.invalidate(),
  })

  function resetForm() {
    setEditing(null)
    setTitle(''); setDescription(''); setGuest(''); setGuestTitle('')
    setEmbedUrl(''); setAudioUrl(''); setDuration('30 min')
    setEpisodeNumber(''); setDate(''); setPublished(false); setFeatured(false)
  }

  function startEdit(ep: any) {
    setEditing(ep.id)
    setTitle(ep.title); setDescription(ep.description || ''); setGuest(ep.guest || '')
    setGuestTitle(ep.guestTitle || ''); setEmbedUrl(ep.embedUrl || ''); setAudioUrl(ep.audioUrl || '')
    setDuration(ep.duration || '30 min'); setEpisodeNumber(ep.episodeNumber?.toString() || '')
    setDate(ep.date || ''); setPublished(ep.published); setFeatured(ep.featured)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSave() {
    if (!title.trim()) return
    if (editing) {
      updateMutation.mutate({
        id: editing, title, description, guest, guestTitle, embedUrl, audioUrl,
        duration, episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
        date, published, featured,
      })
    } else {
      createMutation.mutate({
        title, description, guest, guestTitle, embedUrl, audioUrl, duration,
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
        date, published, featured,
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin')} className="text-[#9B9589] hover:text-[#C8A55C] transition-colors flex items-center gap-1 text-[13px] mb-2">
            <ArrowLeft className="w-4 h-4" />Back to Admin
          </button>
          <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Podcast Manager</h1>
          <p className="text-[14px] text-[#9B9589]">Add and manage podcast episodes.</p>
        </div>
        <button onClick={resetForm} className="btn-gold text-[13px] flex items-center gap-2">
          <Plus className="w-4 h-4" />New Episode
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-surface p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="field text-[14px]" placeholder="Episode title" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Guest</label>
            <input value={guest} onChange={e => setGuest(e.target.value)} className="field text-[14px]" placeholder="Guest name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Guest Title</label>
            <input value={guestTitle} onChange={e => setGuestTitle(e.target.value)} className="field text-[14px]" placeholder="e.g. Bestselling Author" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Duration</label>
            <input value={duration} onChange={e => setDuration(e.target.value)} className="field text-[14px]" placeholder="30 min" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Episode #</label>
            <input value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)} className="field text-[14px]" placeholder="42" />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="field text-[14px] h-16 resize-none" placeholder="Episode description" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Embed URL (Spotify, Apple, YouTube iframe)</label>
          <input value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} className="field text-[14px]" placeholder="https://open.spotify.com/embed/episode/..." />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Audio URL (direct MP3 link)</label>
          <input value={audioUrl} onChange={e => setAudioUrl(e.target.value)} className="field text-[14px]" placeholder="https://cdn.example.com/episode42.mp3" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#9B9589] uppercase tracking-wider mb-1.5 block">Date</label>
          <input value={date} onChange={e => setDate(e.target.value)} className="field text-[14px]" placeholder="May 25, 2026" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 accent-[#C8A55C]" />
            <span className="text-[13px]">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-[#C8A55C]" />
            <span className="text-[13px]">Featured</span>
          </label>
          <div className="flex-1" />
          <button onClick={handleSave} disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
            className="btn-gold text-[13px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />{editing ? 'Update Episode' : 'Create Episode'}
          </button>
        </div>
      </motion.div>

      {/* Episodes List */}
      <div>
        <h2 className="text-[20px] font-semibold mb-4">All Episodes ({episodes?.length || 0})</h2>
        {isLoading ? <p className="text-[14px] text-[#9B9589]">Loading episodes...</p> : (
          <div className="space-y-2">
            {episodes?.map((ep: any) => (
              <div key={ep.id} className="glass-surface p-4 flex items-center gap-4 card-hover">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${ep.published ? 'bg-[rgba(74,222,128,0.12)] text-[#4ADE80]' : 'bg-[rgba(245,240,232,0.06)] text-[#9B9589]'}`}>{ep.published ? 'Published' : 'Draft'}</span>
                    {ep.featured && <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-[rgba(200,165,92,0.12)] text-[#C8A55C]">Featured</span>}
                    <span className="text-[11px] font-mono text-[#C8A55C]">EP.{ep.episodeNumber || ep.id}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold truncate">{ep.title}</h3>
                  <p className="text-[12px] text-[#9B9589]">{ep.guest} | {ep.duration} | {ep.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ep.embedUrl && <a href={ep.embedUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all">
                    <ExternalLink className="w-3.5 h-3.5 text-[#9B9589]" />
                  </a>}
                  <button onClick={() => startEdit(ep)} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all">
                    <Edit3 className="w-3.5 h-3.5 text-[#9B9589]" />
                  </button>
                  <button onClick={() => toggleMutation.mutate({ id: ep.id })} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(245,240,232,0.1)] transition-all" title={ep.published ? 'Unpublish' : 'Publish'}>
                    {ep.published ? <XCircle className="w-3.5 h-3.5 text-[#EF4444]" /> : <CheckCircle className="w-3.5 h-3.5 text-[#4ADE80]" />}
                  </button>
                  <button onClick={() => { if (confirm('Delete this episode?')) deleteMutation.mutate({ id: ep.id }) }} className="w-8 h-8 rounded-lg bg-[rgba(245,240,232,0.06)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.15)] transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))}
            {(!episodes || episodes.length === 0) && <p className="text-[14px] text-[#9B9589] text-center py-8">No episodes yet. Create your first podcast episode above.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
