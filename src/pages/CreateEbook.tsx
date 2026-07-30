import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useSubscription } from '@/hooks/useSubscription'
import SubscribePrompt from '@/components/SubscribePrompt'
import { useToast } from '@/hooks/useToast'
import {
  Sparkles, FileText, ChevronRight, ChevronLeft, BookOpen,
  Type, User, Tag, Eye, Check, Loader2, Upload, X, FileUp,
  AlertCircle
} from 'lucide-react'

type Step = 'mode' | 'details' | 'confirm'
type CreationMode = 'scratch' | 'upload'

export default function CreateEbook() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<CreationMode | null>(null)
  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedContent, setParsedContent] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();

  // ── Mutations ────────────────────────────────────────────────────────

  const createMutation = trpc.ebook.create.useMutation({
    onSuccess: (data) => {
      if (parsedContent) {
        saveContentMutation.mutate({
          id: data.id,
          content: parsedContent,
          title: title || undefined,
          description: description || undefined,
        })
      }
      setIsSubmitting(false)
      navigate(`/editor/${data.id}`)
    },
    onError: (err) => {
      setIsSubmitting(false)
      toast({
        title: 'Create Failed',
        description: err.message || 'Could not create eBook. Please try again.',
        variant: 'destructive'
      })
    },
  })

  const saveContentMutation = trpc.ebook.update.useMutation({
    onError: (err) => {
      toast({
        title: 'Save Warning',
        description: 'Book created but content auto-save failed: ' + err.message,
        variant: 'destructive'
      })
    },
  })

  // ── FILE UPLOAD: uses fileUpload.parseText (NOT ebook.parseFile) ────
  const parseMutation = trpc.fileUpload.parseText.useMutation({
    onSuccess: (data) => {
      setIsParsing(false)
      setParsedContent(data.content)
      setTitle(data.title)
      if (data.description) setDescription(data.description)
      setUploadError('')
      toast({
        title: 'File Parsed',
        description: `Extracted ${data.wordCount.toLocaleString()} words from "${data.title}"`,
      })
    },
    onError: (err) => {
      setIsParsing(false)
      const msg = err.message || 'Failed to parse file'
      setUploadError(msg)
      toast({ title: 'Parse Failed', description: msg, variant: 'destructive' })
    },
  })

  // ── File handling ────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.')
      return
    }

    setUploadedFile(file)
    setUploadError('')
    setIsParsing(true)

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      if (!base64) {
        setIsParsing(false)
        setUploadError('Failed to read file: empty content')
        return
      }
      parseMutation.mutate({
        filename: file.name,
        contentBase64: base64,
        mimeType: file.type,
      })
    }
    reader.onerror = () => {
      setIsParsing(false)
      setUploadError('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }, [parseMutation])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be selected again
    e.target.value = ''
  }, [handleFile])

  const clearUpload = useCallback(() => {
    setUploadedFile(null)
    setParsedContent('')
    setTitle('')
    setDescription('')
    setUploadError('')
  }, [])

  // ── Create book ──────────────────────────────────────────────────────

  const handleCreate = useCallback(() => {
    if (!title.trim() || isSubmitting || createMutation.isPending) return
    setIsSubmitting(true)
    setUploadError('')

    createMutation.mutate({
      title: title.trim(),
      authorName: authorName.trim() || undefined,
      description: description.trim() || undefined,
      category: category as any,
      visibility,
    })
  }, [title, authorName, description, category, visibility, isSubmitting, createMutation])

  // ── Navigation guards ────────────────────────────────────────────────

  const canProceed = {
    mode: mode !== null,
    details: mode === 'upload' ? title.trim().length > 0 : title.trim().length > 0,
    confirm: true,
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'mode', label: 'Choose Method' },
    { key: 'details', label: mode === 'upload' ? 'Upload File' : 'Book Details' },
    { key: 'confirm', label: 'Confirm' },
  ]

  const goNext = useCallback(() => {
    if (step === 'mode') setStep('details')
    else if (step === 'details') setStep('confirm')
    else if (step === 'confirm') handleCreate()
  }, [step, handleCreate])

  const goBack = useCallback(() => {
    if (step === 'mode') navigate('/dashboard')
    else if (step === 'details') setStep('mode')
    else if (step === 'confirm') setStep('details')
  }, [step, navigate])

  // ── Subscription gate (after all hooks) ──────────────────────────────

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#C8A55C] animate-spin" />
      </div>
    )
  }

  if (!hasActiveSubscription) {
    return <SubscribePrompt />
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <span className="shimmer-text text-[11px] font-medium tracking-[0.12em] uppercase">Create New eBook</span>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] mt-2">Let's Create Something Great</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all ${
              step === s.key ? 'bg-[#C8A55C] text-[#1A1A1F]' : steps.findIndex(x => x.key === step) > i ? 'bg-[#7AAE7A] text-white' : 'bg-[#232328] text-[#9B9589] border border-[rgba(245,240,232,0.08)]'
            }`}>
              {steps.findIndex(x => x.key === step) > i ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[12px] font-medium hidden sm:block ${step === s.key ? 'text-[#F5F0E8]' : 'text-[#9B9589]'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-[rgba(245,240,232,0.08)] mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Choose Mode */}
        {step === 'mode' && (
          <motion.div key="mode" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-[20px] font-semibold mb-4">How would you like to start?</h2>
            <button onClick={() => setMode('scratch')} className={`w-full glass-surface p-6 text-left card-hover transition-all ${mode === 'scratch' ? 'border-[#C8A55C] shadow-[0_0_30px_rgba(200,165,92,0.08)]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mode === 'scratch' ? 'bg-[rgba(200,165,92,0.2)]' : 'bg-[rgba(200,165,92,0.08)]'}`}>
                  <Sparkles className={`w-6 h-6 ${mode === 'scratch' ? 'text-[#C8A55C]' : 'text-[#9B9589]'}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold mb-1">Start from Scratch</h3>
                  <p className="text-[14px] text-[#9B9589] leading-relaxed">Let Virtus AI help you create an eBook from a simple prompt. Our AI will guide you through outlining, writing, and editing.</p>
                </div>
              </div>
            </button>
            <button onClick={() => setMode('upload')} className={`w-full glass-surface p-6 text-left card-hover transition-all ${mode === 'upload' ? 'border-[#C8A55C] shadow-[0_0_30px_rgba(200,165,92,0.08)]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mode === 'upload' ? 'bg-[rgba(200,165,92,0.2)]' : 'bg-[rgba(245,240,232,0.04)]'}`}>
                  <FileText className={`w-6 h-6 ${mode === 'upload' ? 'text-[#C8A55C]' : 'text-[#9B9589]'}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold mb-1">Upload Manuscript</h3>
                  <p className="text-[14px] text-[#9B9589] leading-relaxed">Upload your existing manuscript (TXT, PDF, DOCX) and we'll extract the text, auto-detect the title, and prep it for editing and publishing.</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* STEP 2: Details / Upload */}
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {mode === 'upload' ? (
              /* UPLOAD MODE */
              <>
                <h2 className="text-[20px] font-semibold mb-4">Upload Your Manuscript</h2>

                {/* Drag & Drop Zone */}
                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-[#C8A55C] bg-[rgba(200,165,92,0.08)]' : 'border-[rgba(245,240,232,0.14)] hover:border-[rgba(245,240,232,0.24)] hover:bg-[rgba(245,240,232,0.02)]'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx,.doc,.md" className="hidden" onChange={handleFileInput} />
                    <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-[#C8A55C]' : 'text-[#9B9589]'}`} />
                    <p className="text-[14px] font-medium mb-1">Drag & drop your manuscript here</p>
                    <p className="text-[12px] text-[#9B9589]">or click to browse — supports TXT, PDF, DOCX</p>
                    <p className="text-[11px] text-[#9B9589] mt-2">Maximum file size: 10MB</p>
                  </div>
                ) : (
                  /* File Uploaded - Show Status */
                  <div className="glass-surface p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[rgba(200,165,92,0.12)] flex items-center justify-center">
                        <FileUp className="w-5 h-5 text-[#C8A55C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-[11px] text-[#9B9589]">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={clearUpload} className="p-1.5 rounded hover:bg-[rgba(239,68,68,0.1)] text-[#9B9589] hover:text-[#EF4444] transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {isParsing && (
                      <div className="flex items-center gap-2 text-[12px] text-[#C8A55C]">
                        <Loader2 className="w-4 h-4 animate-spin" />Parsing manuscript...
                      </div>
                    )}

                    {parseMutation.data && !isParsing && (
                      <div className="space-y-2 text-[12px]">
                        <div className="flex justify-between"><span className="text-[#9B9589]">Words detected:</span><span className="font-medium">{parseMutation.data.wordCount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#9B9589]">Characters:</span><span className="font-medium">{parseMutation.data.charCount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#9B9589]">Title extracted:</span><span className="font-medium text-[#4ADE80]">{parseMutation.data.title}</span></div>
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] text-[12px] text-[#C27070]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Always show editable fields */}
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Type className="w-3.5 h-3.5" />eBook Title <span className="text-[#C27070]">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your eBook title" className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><User className="w-3.5 h-3.5" />Author Name</label>
                  <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your pen name or real name" className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><FileText className="w-3.5 h-3.5" />Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of your eBook" rows={3} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Tag className="w-3.5 h-3.5" />Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] transition-all appearance-none cursor-pointer">
                      <option value="fiction">Fiction</option><option value="non-fiction">Non-Fiction</option><option value="business">Business</option><option value="technology">Technology</option><option value="self-help">Self-Help</option><option value="academic">Academic</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Eye className="w-3.5 h-3.5" />Visibility</label>
                    <select value={visibility} onChange={e => setVisibility(e.target.value as 'public' | 'private')} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] transition-all appearance-none cursor-pointer">
                      <option value="private">Private — Only you can see</option><option value="public">Public — Visible in store</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* SCRATCH MODE */
              <>
                <h2 className="text-[20px] font-semibold mb-4">Tell us about your eBook</h2>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Type className="w-3.5 h-3.5" />eBook Title <span className="text-[#C27070]">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your eBook title" className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><User className="w-3.5 h-3.5" />Author Name</label>
                  <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your pen name or real name" className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><FileText className="w-3.5 h-3.5" />Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of your eBook" rows={4} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Tag className="w-3.5 h-3.5" />Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] transition-all appearance-none cursor-pointer">
                      <option value="fiction">Fiction</option><option value="non-fiction">Non-Fiction</option><option value="business">Business</option><option value="technology">Technology</option><option value="self-help">Self-Help</option><option value="academic">Academic</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[13px] font-medium text-[#9B9589] mb-1.5"><Eye className="w-3.5 h-3.5" />Visibility</label>
                    <select value={visibility} onChange={e => setVisibility(e.target.value as 'public' | 'private')} className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] transition-all appearance-none cursor-pointer">
                      <option value="private">Private — Only you can see</option><option value="public">Public — Visible in store</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* STEP 3: Confirm */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-[20px] font-semibold mb-4">Ready to create?</h2>
            <div className="glass-surface p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-24 rounded-lg bg-[#2E2E35] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#9B9589]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold">{title}</h3>
                  <p className="text-[14px] text-[#9B9589]">{authorName || 'Anonymous'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] capitalize">{category}</span>
                </div>
              </div>
              {description && <div className="pt-3 border-t border-[rgba(245,240,232,0.06)]"><p className="text-[14px] text-[#9B9589] leading-relaxed">{description}</p></div>}
              <div className="flex gap-4 pt-3 border-t border-[rgba(245,240,232,0.06)]">
                <div><span className="text-[11px] text-[#9B9589] uppercase tracking-wider">Method</span><p className="text-[13px] font-medium capitalize">{mode === 'scratch' ? 'AI Assisted' : 'Manuscript Upload'}</p></div>
                <div><span className="text-[11px] text-[#9B9589] uppercase tracking-wider">Visibility</span><p className="text-[13px] font-medium capitalize">{visibility}</p></div>
                {parsedContent && <div><span className="text-[11px] text-[#9B9589] uppercase tracking-wider">Content</span><p className="text-[13px] font-medium text-[#4ADE80]">{(parsedContent.length / 5).toFixed(0)} words extracted</p></div>}
              </div>
            </div>
            <div className="glass-surface p-4 border border-[rgba(122,174,122,0.2)]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#C8A55C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium mb-1">
                    {parsedContent ? 'Manuscript Ready for Editing' : 'AI Assistant Ready'}
                  </p>
                  <p className="text-[13px] text-[#9B9589]">
                    {parsedContent
                      ? 'Your uploaded manuscript has been parsed and is ready for editing. You can refine, enhance, and publish it from the editor.'
                      : 'Our AI will help you outline, write, and refine your eBook chapter by chapter.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Show any errors from create mutation */}
            {createMutation.error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] text-[12px] text-[#C27070]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Creation failed</p>
                  <p>{createMutation.error.message}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-6 mt-8 border-t border-[rgba(245,240,232,0.06)]">
        <button onClick={goBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(245,240,232,0.14)] text-[13px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
          <ChevronLeft className="w-4 h-4" />{step === 'mode' ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={goNext}
          disabled={!canProceed[step] || isSubmitting || createMutation.isPending || isParsing}
          className="inline-flex items-center gap-2 btn-gold text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || createMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
          ) : step === 'confirm' ? (
            <><Sparkles className="w-4 h-4" />Create eBook</>
          ) : (
            <>{mode === 'upload' && step === 'details' && !uploadedFile ? 'Skip Upload' : 'Next'}<ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}
