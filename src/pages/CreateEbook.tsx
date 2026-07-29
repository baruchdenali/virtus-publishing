import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Sparkles, FileText, Upload, ArrowRight, ArrowLeft, Check, BookOpen, Loader2, Wand2, Edit3, Type, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSubscription } from '@/hooks/useSubscription'
import SubscribePrompt from '@/components/SubscribePrompt'
import { useToast } from '@/hooks/useToast'

const CATEGORIES = ['fiction', 'non-fiction', 'business', 'technology', 'self-help', 'academic', 'other']

const AI_OPTIONS = [
  { id: 'outline', label: 'Generate Outline', description: 'AI creates a chapter-by-chapter structure', icon: FileText },
  { id: 'write', label: 'Write Chapter', description: 'AI drafts content for a selected chapter', icon: Edit3 },
  { id: 'review', label: 'Content Review', description: 'AI reviews and suggests improvements', icon: Check },
  { id: 'title', label: 'Generate Titles', description: 'AI suggests catchy book titles', icon: Type },
  { id: 'marketing', label: 'Marketing Copy', description: 'AI creates promotional descriptions', icon: Megaphone },
]

export default function CreateEbook() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedContent, setParsedContent] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['outline', 'write'])
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)

  const { hasActiveSubscription, isLoading: subLoading } = useSubscription()

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
      navigate(`/editor/${data.id}`)
      setIsSubmitting(false)
    },
    onError: (err) => {
      setIsSubmitting(false)
      toast({ title: 'Create Failed', description: err.message || 'Could not create eBook. Please try again.', variant: 'destructive' })
    },
  })

  const saveContentMutation = trpc.ebook.update.useMutation({
    onError: (err) => {
      toast({ title: 'Save Warning', description: 'Book created but content auto-save failed: ' + err.message, variant: 'destructive' })
    },
  })

  const parseMutation = trpc.ebook.parseFile.useMutation({
    onSuccess: (data) => {
      setIsParsing(false)
      if (data.content) setParsedContent(data.content)
      if (data.title && !title) setTitle(data.title)
    },
    onError: (err) => {
      setIsParsing(false)
      toast({ title: 'Parse Failed', description: err.message, variant: 'destructive' })
    },
  })

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, o])
  }

  const canProceed: Record<number, boolean> = {
    1: title.trim().length >= 3,
    2: true,
    3: true,
  }

  const handleCreate = () => {
    if (!title.trim() || isSubmitting || createMutation.isPending) return
    setIsSubmitting(true)
    createMutation.mutate({
      title: title.trim(),
      authorName: authorName.trim() || undefined,
      description: description.trim() || undefined,
      category: selectedCategory || undefined,
      visibility,
      price: isFree ? undefined : price ? parseFloat(price) : undefined,
      isFree,
    })
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    setIsParsing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        parseMutation.mutate({ content, fileName: file.name })
      } else {
        setIsParsing(false)
      }
    }
    reader.readAsText(file)
  }

  if (authLoading || subLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#C8A55C]" /></div>
  }

  if (!hasActiveSubscription) {
    return <SubscribePrompt />
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your eBook</h1>
        <p className="text-[#9B9589]">Step {step} of 3 — {step === 1 ? 'Book Details' : step === 2 ? 'AI & Content' : 'Confirm & Publish'}</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#C8A55C]' : 'bg-[rgba(245,240,232,0.08)]'}`} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Book Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter your book title" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="author">Author Name</Label>
            <Input id="author" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your name or pen name" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of your book" className="mt-1.5" rows={4} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Visibility</Label><p className="text-xs text-[#9B9589]">{visibility === 'public' ? 'Visible in store' : 'Private, invite only'}</p></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9B9589]">{visibility === 'public' ? 'Public' : 'Private'}</span>
              <Switch checked={visibility === 'private'} onCheckedChange={v => setVisibility(v ? 'private' : 'public')} />
            </div>
          </div>
          <div>
            <Label>Pricing</Label>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex-1">
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" disabled={isFree} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isFree} onCheckedChange={setIsFree} />
                <span className="text-sm text-[#9B9589]">Free</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">AI Assistance</h3>
            <p className="text-sm text-[#9B9589] mb-4">Select AI features to help create your book</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_OPTIONS.map(opt => {
                const Icon = opt.icon
                const selected = selectedOptions.includes(opt.id)
                return (
                  <button key={opt.id} onClick={() => toggleOption(opt.id)} className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selected ? 'border-[#C8A55C] bg-[rgba(200,165,92,0.06)]' : 'border-[rgba(245,240,232,0.06)] hover:border-[rgba(245,240,232,0.12)]'}`}>
                    <div className={`p-2 rounded-lg ${selected ? 'bg-[#C8A55C] text-[#1A1A1F]' : 'bg-[#2E2E35] text-[#9B9589]'}`}><Icon className="w-4 h-4" /></div>
                    <div><p className="font-medium text-sm">{opt.label}</p><p className="text-xs text-[#9B9589]">{opt.description}</p></div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1">Manuscript Upload</h3>
            <p className="text-sm text-[#9B9589] mb-4">Upload an existing manuscript (PDF, DOCX, TXT)</p>
            <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-[#C8A55C] bg-[rgba(200,165,92,0.06)]' : 'border-[rgba(245,240,232,0.08)]'}`}>
              <Upload className="w-8 h-8 mx-auto mb-3 text-[#9B9589]" />
              <p className="text-sm text-[#F5F0E8]">Drag & drop your manuscript here</p>
              <p className="text-xs text-[#9B9589] mt-1">or click to browse</p>
            </div>
            {isParsing && <p className="text-sm text-[#C8A55C] mt-2">Parsing manuscript...</p>}
            {parsedContent && <p className="text-sm text-[#6ADD92] mt-2">Manuscript parsed successfully! Content will be included.</p>}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-[#232328] rounded-xl p-6 border border-[rgba(245,240,232,0.06)]">
            <h3 className="font-semibold mb-4">Book Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#9B9589]">Title:</span> {title}</p>
              <p><span className="text-[#9B9589]">Author:</span> {authorName || 'Not set'}</p>
              <p><span className="text-[#9B9589]">Category:</span> {selectedCategory || 'Not set'}</p>
              <p><span className="text-[#9B9589]">Visibility:</span> {visibility}</p>
              <p><span className="text-[#9B9589]">Price:</span> {isFree ? 'Free' : price ? `$${price}` : 'Not set'}</p>
              <p><span className="text-[#9B9589]">AI Features:</span> {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None'}</p>
              <p><span className="text-[#9B9589]">Manuscript:</span> {parsedContent ? 'Uploaded' : 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        ) : <div />}
        {step < 3 ? (
          <Button onClick={() => canProceed[step] && setStep(step + 1)} disabled={!canProceed[step]} className="gap-2 btn-gold">Next <ArrowRight className="w-4 h-4" /></Button>
        ) : (
          <Button onClick={handleCreate} disabled={!canProceed[step] || isSubmitting || createMutation.isPending || isParsing} className="gap-2 btn-gold">
            {isSubmitting || createMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Create Book</>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
