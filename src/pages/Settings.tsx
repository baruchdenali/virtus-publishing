import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  User, Lock, Bell, Palette, Camera, Save, Loader2, Check,
  Shield, Trash2, AlertTriangle
} from 'lucide-react'

type Tab = 'profile' | 'account' | 'preferences'

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Settings() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { data: profile, isLoading } = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  })

  const utils = trpc.useUtils()

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.profile.invalidate()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
  })

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setWebsite(profile.website || '')
    }
  }, [profile])

  const handleSaveProfile = () => {
    updateMutation.mutate({
      name: name || undefined,
      bio: bio || undefined,
      website: website || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#C8A55C] animate-spin" />
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'account', label: 'Account', icon: Lock },
    { key: 'preferences', label: 'Preferences', icon: Palette },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em]">Settings</h1>
        <p className="text-[14px] text-[#9B9589] mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#232328] border border-[rgba(245,240,232,0.06)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#C8A55C] text-[#1A1A1F] font-semibold'
                : 'text-[#9B9589] hover:text-[#F5F0E8]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            {/* Avatar */}
            <div className="glass-surface p-6">
              <h3 className="text-[16px] font-semibold mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-[#2E2E35] flex items-center justify-center text-[28px] font-semibold text-[#F5F0E8] border-2 border-[rgba(200,165,92,0.2)] overflow-hidden group cursor-pointer">
                  {(name || profile?.name || 'U').charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-[14px] text-[#9B9589] mb-2">Click to upload a new avatar</p>
                  <p className="text-[12px] text-[#9B9589]">JPG, PNG. Max 2MB.</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="glass-surface p-6 space-y-5">
              <h3 className="text-[16px] font-semibold mb-2">Profile Information</h3>

              <div>
                <label className="block text-[13px] font-medium text-[#9B9589] mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#9B9589] mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell readers about yourself..."
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all resize-none"
                />
                <div className="text-right text-[11px] text-[#9B9589] mt-1">{bio.length}/500</div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#9B9589] mb-1.5">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[14px] text-[#F5F0E8] placeholder:text-[#9B9589] outline-none focus:border-[#C8A55C] focus:shadow-[0_0_0_3px_rgba(200,165,92,0.15)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#9B9589] mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.06)] text-[14px] text-[#9B9589] cursor-not-allowed"
                />
                <p className="text-[11px] text-[#9B9589] mt-1">Email cannot be changed</p>
              </div>

              <div className="pt-4 border-t border-[rgba(245,240,232,0.06)] flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 btn-gold text-[13px] disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
                {saveSuccess && (
                  <span className="text-[12px] text-[#7AAE7A]">Profile updated successfully</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div
            key="account"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="glass-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#C8A55C]" />
                <h3 className="text-[16px] font-semibold">Security</h3>
              </div>
              <p className="text-[14px] text-[#9B9589] mb-4">
                Your account is secured with OAuth 2.0 authentication. 
                Password changes are managed through your identity provider.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(122,174,122,0.06)] border border-[rgba(122,174,122,0.15)]">
                <Check className="w-5 h-5 text-[#7AAE7A]" />
                <div>
                  <p className="text-[14px] font-medium">Authentication Active</p>
                  <p className="text-[12px] text-[#9B9589]">OAuth 2.0 with encrypted session tokens</p>
                </div>
              </div>
            </div>

            <div className="glass-surface p-6 border border-[rgba(194,112,112,0.15)]">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#C27070]" />
                <h3 className="text-[16px] font-semibold text-[#C27070]">Danger Zone</h3>
              </div>
              <p className="text-[14px] text-[#9B9589] mb-4">
                Once you delete your account, there is no going back. All your eBooks, data, and settings will be permanently removed.
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C27070] text-[13px] font-medium text-[#C27070] hover:bg-[rgba(194,112,112,0.08)] transition-all">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="glass-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-[#C8A55C]" />
                <h3 className="text-[16px] font-semibold">Appearance</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[rgba(245,240,232,0.04)]">
                  <div>
                    <p className="text-[14px] font-medium">Dark Mode</p>
                    <p className="text-[12px] text-[#9B9589]">Always use dark theme for the editor</p>
                  </div>
                  <div className="w-11 h-6 rounded-full bg-[#C8A55C] relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[14px] font-medium">Editor Font Size</p>
                    <p className="text-[12px] text-[#9B9589]">Adjust the text size in the editor</p>
                  </div>
                  <select className="px-3 py-1.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.14)] text-[13px] text-[#F5F0E8] outline-none cursor-pointer">
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-[#C8A55C]" />
                <h3 className="text-[16px] font-semibold">Notifications</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'New Purchases', desc: 'When someone buys your eBook', defaultOn: true },
                  { label: 'New Reviews', desc: 'When someone reviews your eBook', defaultOn: true },
                  { label: 'AI Suggestions', desc: 'Weekly AI writing tips', defaultOn: false },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between py-3 border-b border-[rgba(245,240,232,0.04)] last:border-0">
                    <div>
                      <p className="text-[14px] font-medium">{notif.label}</p>
                      <p className="text-[12px] text-[#9B9589]">{notif.desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notif.defaultOn ? 'bg-[#C8A55C]' : 'bg-[#2E2E35]'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notif.defaultOn ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
