import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import SubscribePrompt from '@/components/SubscribePrompt'
import {
  Sparkles, Send, Save, Eye, ArrowLeft, Bold, Italic, Heading,
  List, ListOrdered, Link, Image, BookOpen, Loader2,
  Wand2, X, ChevronRight, Check
} from 'lucide-react'

export default function Editor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription()
  const ebookId = Number(id)
  const [content, setContent] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(true)
  const [localTitle, setLocalTitle] = useState('')
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const aiMessagesEndRef = useRef<HTMLDivElement>(null)

  const { data: ebook, isLoading } = trpc.ebook.getById.useQuery(
    { id: ebookId },
    { enabled: isAuthenticated && !!ebookId && hasActiveSubscription }
  )

  const { data: messages } = trpc.ai.listMessages.useQuery(
    { conversationId: activeConversationId ?? 0 },
    { enabled: !!activeConversationId && hasActiveSubscription }
  )

  const utils = trpc.useUtils()

  const updateMutation = trpc.ebook.update.useMutation({
    onSuccess: () => {
      utils.ebook.getById.invalidate({ id: ebookId })
    },
  })

  const createConversationMutation = trpc.ai.createConversation.useMutation({
    onSuccess: (data) => {
      setActiveConversationId(data.id)
      utils.ai.listConversations.invalidate()
    },
  })

  const sendMessageMutation = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      if (activeConversationId) {
        utils.ai.listMessages.invalidate({ conversationId: activeConversationId })
      }
      setAiPrompt('')
    },
  })

  const publishMutation = trpc.ebook.publish.useMutation({
    onSuccess: () => {
      utils.ebook.getById.invalidate({ id: ebookId })
    },
  })

  useEffect(() => {
    if (ebook) {
      setContent(ebook.content || '')
      setLocalTitle(ebook.title)
    }
  }, [ebook])

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSave = () => {
    updateMutation.mutate({
      id: ebookId,
      content,
      title: localTitle,
    })
  }

  const handleSendAiMessage = () => {
    if (!aiPrompt.trim()) return
    if (!activeConversationId) {
      createConversationMutation.mutate(
        { title: `eBook: ${localTitle}`, ebookId },
        {
          onSuccess: (conv) => {
            sendMessageMutation.mutate({
              conversationId: conv.id,
              content: aiPrompt,
            })
          },
        }
      )
    } else {
      sendMessageMutation.mutate({
        conversationId: activeConversationId,
        content: aiPrompt,
      })
    }
  }

  const handlePublish = () => {
    publishMutation.mutate({ id: ebookId })
  }

  const insertAiResponse = (text: string) => {
    setContent((prev) => prev + '\n\n' + text)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#C8A55C] animate-spin" />
      </div>
    )
  }

  if (!ebook) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-[#9B9589] mx-auto mb-4" />
        <h2 className="text-[20px] font-semibold mb-2">eBook Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-gold text-[13px]">Back to Dashboard</button>
      </div>
    )
  }

  // Subscription gate (all hooks already called above)
  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#C8A55C] animate-spin" />
      </div>
    )
  }

  if (!hasActiveSubscription) {
    return <SubscribePrompt title="Editor Access Requires a Plan" description="Subscribe to edit and publish your eBooks with AI assistance." />
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="bg-transparent text-[18px] font-semibold text-[#F5F0E8] outline-none placeholder:text-[#9B9589]"
            placeholder="eBook Title"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              showAiPanel
                ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]'
                : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              showPreview
                ? 'bg-[rgba(200,165,92,0.15)] text-[#C8A55C]'
                : 'text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(245,240,232,0.14)] text-[12px] font-medium text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
          {ebook.status !== 'published' && (
            <button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="inline-flex items-center gap-2 btn-gold text-[12px] py-2 px-4 disabled:opacity-50"
            >
              {publishMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Publish
            </button>
          )}
          {ebook.status === 'published' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[rgba(122,174,122,0.12)] text-[#7AAE7A]">
              <Check className="w-3.5 h-3.5" />
              Published
            </span>
          )}
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 p-2 rounded-lg glass-surface">
        {[
          { icon: Bold, action: () => {} },
          { icon: Italic, action: () => {} },
          { icon: Heading, action: () => {} },
          { icon: List, action: () => {} },
          { icon: ListOrdered, action: () => {} },
          { icon: Link, action: () => {} },
          { icon: Image, action: () => {} },
        ].map((tool, i) => (
          <button
            key={i}
            onClick={tool.action}
            className="p-1.5 rounded-md text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.06)] transition-all"
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="w-px h-5 bg-[rgba(245,240,232,0.08)] mx-2" />
        <button
          onClick={() => {
            createConversationMutation.mutate({ title: 'Generate Outline', ebookId })
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#C8A55C] bg-[rgba(200,165,92,0.08)] hover:bg-[rgba(200,165,92,0.15)] transition-all"
        >
          <Wand2 className="w-3 h-3" />
          Generate Outline
        </button>
      </div>

      {/* Editor Layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        {/* Text Editor */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showPreview && showAiPanel ? 'w-1/3' : showPreview || showAiPanel ? 'w-1/2' : 'w-full'}`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your masterpiece..."
            className="flex-1 w-full p-5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-[15px] leading-[1.8] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[rgba(245,240,232,0.14)] resize-none font-mono"
            spellCheck={false}
          />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="w-1/3 min-w-0 glass-surface overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(245,240,232,0.06)]">
              <span className="text-[12px] font-medium uppercase tracking-wider text-[#9B9589]">Preview</span>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded text-[#9B9589] hover:text-[#F5F0E8]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="prose prose-invert prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>').replace(/#{1,6}\s+(.+)/g, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Panel */}
        {showAiPanel && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="w-1/3 min-w-0 glass-surface overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(245,240,232,0.06)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8A55C]" />
                <span className="text-[12px] font-medium uppercase tracking-wider text-[#9B9589]">Virtus AI</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7AAE7A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7AAE7A]" />
                </span>
              </div>
              <button onClick={() => setShowAiPanel(false)} className="p-1 rounded text-[#9B9589] hover:text-[#F5F0E8]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!activeConversationId || !messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-10 h-10 text-[#C8A55C] mx-auto mb-3 opacity-50" />
                  <p className="text-[13px] text-[#9B9589] mb-4">Ask Virtus AI to help with your eBook</p>
                  <div className="space-y-2">
                    {[
                      'Generate an outline for my book',
                      'Write the first chapter',
                      'Help me improve this section',
                      'Suggest a better title',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setAiPrompt(suggestion)
                        }}
                        className="block w-full text-left px-3 py-2 rounded-lg text-[12px] text-[#9B9589] bg-[rgba(245,240,232,0.03)] hover:bg-[rgba(245,240,232,0.06)] hover:text-[#F5F0E8] transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] px-3 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#C8A55C] text-[#1A1A1F] rounded-br-sm'
                          : 'bg-[#2E2E35] text-[#F5F0E8] border border-[rgba(245,240,232,0.06)] rounded-bl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => insertAiResponse(msg.content)}
                          className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] hover:bg-[rgba(200,165,92,0.2)] transition-all"
                        >
                          <ChevronRight className="w-3 h-3" />
                          Insert into editor
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={aiMessagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[rgba(245,240,232,0.06)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  placeholder="Ask Virtus AI..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-[13px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] transition-all"
                />
                <button
                  onClick={handleSendAiMessage}
                  disabled={!aiPrompt.trim() || sendMessageMutation.isPending}
                  className="p-2 rounded-lg bg-[#C8A55C] text-[#1A1A1F] hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
