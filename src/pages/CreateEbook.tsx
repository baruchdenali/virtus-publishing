import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import {
  Sparkles, FileText, ChevronRight, ChevronLeft, BookOpen,
  Type, User, Tag, Eye, Check, Loader2
} from 'lucide-react'

type Step = 'mode' | 'details' | 'confirm'
type CreationMode = 'scratch' | 'upload'

export default function CreateEbook() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<CreationMode | null>(null)
  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = trpc.ebook.create.useMutation({
    onSuccess: (data) => {
      navigate(`/editor/${data.id}`)
    },
  })

  const handleCreate = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    createMutation.mutate({
      title: title.trim(),
      authorName: authorName.trim() || undefined,
      description: description.trim() || undefined,
      category: category as any,
      visibility,
    })
  }

  const canProceed = {
    mode: mode !== null,
    details: title.trim().length > 0,
    confirm: true,
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'mode', label: 'Choose Method' },
    { key: 'details', label: 'Book Details' },
    { key: 'confirm', label: 'Confirm' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Create New eBook</span>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] mt-2">Let&apos;s Create Something Great</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all ${
              step === s.key
                ? 'bg-[#C8A55C] text-[#1A1A1F]'
                : steps.findIndex(x => x.key === step) > i
                ? 'bg-[#7AAE7A] text-white'
                : 'bg-[#232328] text-[#9B9589] border border-[rgba(245,240,232,0.08)]'
            }`}>
              {steps.findIndex(x => x.key === step) > i ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[12px] font-medium hidden sm:block ${step === s.key ? 'text-[#F5F0E8]' : 'text-[#9B9589]'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)] mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'mode' && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-[20px] font-semibold mb-4">How would you like to start?</h2>

            <button
              onClick={() => setMode('scratch')}
              className={`w-full glass-surface p-6 text-left card-hover transition-all ${
                mode === 'scratch' ? 'border-[#C8A55C] shadow-[0_0_30px_rgba(200,165,92,0.08)]' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  mode === 'scratch' ? 'bg-[rgba(200,165,92,0.2)]' : 'bg-[rgba(200,165,92,0.08)]'
                }`}>
                  <Sparkles className={`w-6 h-6 ${mode === 'scratch' ? 'text-[#C8A55C]' : 'text-[#9B9589]'}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold mb-1">Start from Scratch</h3>
                  <p className="text-[14px] text-[#9B9589] leading-relaxed">
                    Let Virtus AI help you create an eBook from a simple prompt. 
                    Our AI will guide you through outlining, writing, and editing.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('upload')}
              className={`w-full glass-surface p-6 text-left card-hover transition-all ${
                mode === 'upload' ? 'border-[#C8A55C] shadow-[0_0_30px_rgba(200,165,92,0.08)]' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  mode === 'upload' ? 'bg-[rgba(200,165,92,0.2)]' : 'bg-[rgba(245,240,232,0.04)]'
                }`}>
                  <FileText className={`w-6 h-6 ${mode === 'upload' ? 'text-[#C8A55C]' : 'text-[#9B9589]'}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold mb-1">Upload Manuscript</h3>
                  <p className="text-[14px] text-[#9B9589] leading-relaxed">
                    Upload your existing manuscript (PDF, DOCX, TXT) and we&apos;ll 
                    help you transform it into a polished, professional eBook.
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <h2 className="text-[20px] font-semibold mb-4">Tell us about your eBook</h2>

            <div>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5">
                <Type className="w-3.5 h-3.5" />
                eBook Title <span className="text-[#C27070]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your eBook title"
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5">
                <User className="w-3.5 h-3.5" />
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your pen name or real name"
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your eBook"
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all appearance-none cursor-pointer"
                >
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="self-help">Self-Help</option>
                  <option value="academic">Academic</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all appearance-none cursor-pointer"
                >
                  <option value="private">Private - Only you can see</option>
                  <option value="public">Public - Visible in store</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-[20px] font-semibold mb-4">Ready to create?</h2>

            <div className="glass-surface p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 rounded-lg bg-[#2E2E35] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#9B9589]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold">{title}</h3>
                  <p className="text-[14px] text-[#9B9589]">{authorName || 'Anonymous'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] capitalize">
                    {category}
                  </span>
                </div>
              </div>

              {description && (
                <div className="pt-3 border-t border-[rgba(245,240,232,0.06)]">
                  <p className="text-[14px] text-[#9B9589] leading-relaxed">{description}</p>
                </div>
              )}

              <div className="flex gap-4 pt-3 border-t border-[rgba(245,240,232,0.06)]">
                <div>
                  <span className="text-[11px] text-[#9B9589] uppercase tracking-wider">Method</span>
                  <p className="text-[13px] font-medium capitalize">{mode === 'scratch' ? 'AI Assisted' : 'Manuscript Upload'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#9B9589] uppercase tracking-wider">Visibility</span>
                  <p className="text-[13px] font-medium capitalize">{visibility}</p>
                </div>
              </div>
            </div>

            <div className="glass-surface p-4 border border-[rgba(122,174,122,0.2)]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium mb-1">AI Assistant Ready</p>
                  <p className="text-[13px] text-[#9B9589]">
                    {mode === 'scratch'
                      ? 'Our AI will help you outline, write, and refine your eBook chapter by chapter.'
                      : 'Our AI will analyze your manuscript and help you format and enhance it.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 mt-8 border-t border-[rgba(245,240,232,0.06)]">
        <button
          onClick={() => {
            if (step === 'mode') navigate('/dashboard')
            else if (step === 'details') setStep('mode')
            else if (step === 'confirm') setStep('details')
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 'mode' ? 'Cancel' : 'Back'}
        </button>

        <button
          onClick={() => {
            if (step === 'mode') setStep('details')
            else if (step === 'details') setStep('confirm')
            else if (step === 'confirm') handleCreate()
          }}
          disabled={!canProceed[step] || isSubmitting}
          className="inline-flex items-center gap-2 btn-gold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : step === 'confirm' ? (
            <>
              <Sparkles className="w-4 h-4" />
              Create eBook
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
