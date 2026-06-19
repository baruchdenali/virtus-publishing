// @ts-nocheck
/**
 * MODULE 5: AdGPT Internal Staff Dashboard
 * Admin-only interface for campaign generation, analytics, credit management,
 * platform connectors, and PDF export.
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Megaphone, Shield, Zap, BookOpen, CreditCard, ExternalLink,
  ChevronDown, ChevronUp, Download, Eye, Play, Square, CircleDollarSign,
  RefreshCw, CheckCircle, AlertTriangle, X, Plus, Lock, KeyRound
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function AdGPTDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // --- Role guard ---
  const isAdmin = user?.role === "admin";
  const isOperations = user?.role === "operations";
  const hasAccess = isAdmin || isOperations;

  // --- Local state ---
  const [genForm, setGenForm] = useState({
    clientId: "",
    targetUrl: "",
    bookTitle: "",
    bookAuthor: "",
    ugcScript: "",
    adHeadlines: "",
    platform: "mixed" as "google" | "meta" | "tiktok" | "mixed",
  });
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [ledgerClientId, setLedgerClientId] = useState("");
  const [credForm, setCredForm] = useState({
    staffId: "",
    platform: "google_ads" as "google_ads" | "meta" | "tiktok",
    accessToken: "",
    refreshToken: "",
    accountId: "",
  });
  const [activeTab, setActiveTab] = useState<"campaigns" | "generate" | "ledger" | "connectors">("campaigns");
  const [pushingCampaign, setPushingCampaign] = useState<string | null>(null);

  // --- tRPC queries ---
  const campaignsQuery = trpc.adgpt.list.useQuery(undefined, { enabled: hasAccess });
  const ledgerQuery = trpc.adgpt.ledger.useQuery(
    { clientId: ledgerClientId },
    { enabled: !!ledgerClientId && hasAccess }
  );
  const integrationsQuery = trpc.adgptConnector.listIntegrations.useQuery(
    { staffId: String(user?.id || "") },
    { enabled: hasAccess && !!user?.id }
  );

  // --- tRPC mutations ---
  const generateMutation = trpc.adgpt.generate.useMutation({
    onSuccess: (data) => {
      if (data.error) {
        toast({ title: "Generation Failed", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Campaign Generated", description: `ID: ${data.campaignId?.slice(0, 8)}... Credits left: ${data.creditsRemaining}` });
        utils.adgpt.list.invalidate();
        setActiveTab("campaigns");
      }
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const exportPdfMutation = trpc.adgpt.exportPdf.useMutation({
    onSuccess: (data) => {
      if (data.error) {
        toast({ title: "Export Failed", description: data.error, variant: "destructive" });
        return;
      }
      const blob = new Blob([Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF Exported", description: data.filename });
    },
  });

  const linkCredsMutation = trpc.adgptConnector.linkCredentials.useMutation({
    onSuccess: () => {
      toast({ title: "Credentials Linked", description: "Platform connected successfully." });
      utils.adgptConnector.listIntegrations.invalidate();
    },
    onError: (err) => toast({ title: "Link Failed", description: err.message, variant: "destructive" }),
  });

  const disconnectMutation = trpc.adgptConnector.disconnect.useMutation({
    onSuccess: () => {
      toast({ title: "Disconnected", description: "Platform removed." });
      utils.adgptConnector.listIntegrations.invalidate();
    },
  });

  const pushGoogleMutation = trpc.adgptConnector.pushGoogleAds.useMutation({
    onSuccess: (data) => {
      setPushingCampaign(null);
      if (data.error) toast({ title: "Push Failed", description: data.error, variant: "destructive" });
      else toast({ title: "Pushed to Google Ads", description: `Status: ${data.campaignStatus}` });
      utils.adgpt.list.invalidate();
    },
  });
  const pushMetaMutation = trpc.adgptConnector.pushMeta.useMutation({
    onSuccess: (data) => {
      setPushingCampaign(null);
      if (data.error) toast({ title: "Push Failed", description: data.error, variant: "destructive" });
      else toast({ title: "Pushed to Meta", description: `Status: ${data.campaignStatus}` });
      utils.adgpt.list.invalidate();
    },
  });
  const pushTikTokMutation = trpc.adgptConnector.pushTikTok.useMutation({
    onSuccess: (data) => {
      setPushingCampaign(null);
      if (data.error) toast({ title: "Push Failed", description: data.error, variant: "destructive" });
      else toast({ title: "Pushed to TikTok", description: `Status: ${data.campaignStatus}` });
      utils.adgpt.list.invalidate();
    },
  });

  // --- Handlers ---
  const handleGenerate = () => {
    if (!genForm.clientId || !genForm.targetUrl || !genForm.bookTitle) {
      toast({ title: "Missing Fields", description: "Client ID, Target URL, and Book Title are required.", variant: "destructive" });
      return;
    }
    generateMutation.mutate(genForm);
  };

  const handleExportPdf = (id: string) => {
    exportPdfMutation.mutate({ recordId: id });
  };

  const handleLinkCredentials = () => {
    if (!credForm.staffId || !credForm.accessToken || !credForm.accountId) {
      toast({ title: "Missing Fields", description: "Staff ID, Access Token, and Account ID are required.", variant: "destructive" });
      return;
    }
    linkCredsMutation.mutate({
      staffId: credForm.staffId,
      platform: credForm.platform,
      credentials: {
        accessToken: credForm.accessToken,
        refreshToken: credForm.refreshToken || "",
        accountId: credForm.accountId,
      },
    });
  };

  const handlePush = (campaignId: string, platform: "google_ads" | "meta" | "tiktok") => {
    if (!user?.id) return;
    setPushingCampaign(campaignId);
    if (platform === "google_ads") pushGoogleMutation.mutate({ staffId: String(user.id), campaignId });
    if (platform === "meta") pushMetaMutation.mutate({ staffId: String(user.id), campaignId });
    if (platform === "tiktok") pushTikTokMutation.mutate({ staffId: String(user.id), campaignId });
  };

  // --- Guard: non-staff sees nothing ---
  if (!isAuthenticated || !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield className="w-16 h-16 text-[#C8A55C] mb-4 opacity-40" />
        <h2 className="text-2xl font-semibold text-[#F5F0E8] mb-2">Staff Access Required</h2>
        <p className="text-[#9B9589] max-w-md">The AdGPT engine is restricted to admin and operations staff. Contact your administrator for access.</p>
        <button onClick={() => navigate("/")} className="mt-6 btn-gold text-sm px-6 py-2">Go Home</button>
      </div>
    );
  }

  const campaigns = campaignsQuery.data || [];
  const integrations = integrationsQuery.data || [];

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Megaphone className="w-7 h-7 text-[#C8A55C]" />
            <h1 className="text-3xl font-bold tracking-tight">AdGPT Engine</h1>
          </div>
          <p className="text-[#9B9589] text-sm mt-1">AI-powered ad campaign generation for book marketing. Staff only.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(200,165,92,0.12)] text-[#C8A55C] border border-[rgba(200,165,92,0.2)]">
            <Lock className="w-3 h-3" /> {user?.role?.toUpperCase()}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(74,222,128,0.1)] text-[#6ADD92] border border-[rgba(74,222,128,0.2)]">
            <Zap className="w-3 h-3" /> AES-256-GCM
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#232328] mb-6 overflow-x-auto">
        {(["campaigns", "generate", "ledger", "connectors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#C8A55C] text-[#1A1A1F]"
                : "text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)]"
            }`}
          >
            {tab === "campaigns" && <BookOpen className="w-4 h-4" />}
            {tab === "generate" && <Zap className="w-4 h-4" />}
            {tab === "ledger" && <CreditCard className="w-4 h-4" />}
            {tab === "connectors" && <KeyRound className="w-4 h-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "campaigns" && campaigns.length > 0 && (
              <span className="ml-1 text-[10px] font-bold bg-[rgba(245,240,232,0.15)] px-1.5 py-0.5 rounded-full">{campaigns.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ========== CAMPAIGNS TAB ========== */}
      {activeTab === "campaigns" && (
        <div>
          {campaignsQuery.isLoading ? (
            <div className="text-center py-16 text-[#9B9589]">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-[#232328] rounded-2xl border border-[rgba(245,240,232,0.06)]">
              <Megaphone className="w-12 h-12 text-[#9B9589] mx-auto mb-3 opacity-40" />
              <p className="text-[#9B9589]">No campaigns yet. Generate your first one.</p>
              <button onClick={() => setActiveTab("generate")} className="mt-4 btn-gold text-sm px-4 py-2">
                <Plus className="w-4 h-4 inline mr-1" /> Generate Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => {
                const isExpanded = expandedCampaign === camp.id;
                return (
                  <div
                    key={camp.id}
                    className="bg-[#232328] rounded-xl border border-[rgba(245,240,232,0.06)] overflow-hidden transition-all"
                  >
                    {/* Row */}
                    <div
                      className="flex flex-col md:flex-row md:items-center gap-4 p-4 cursor-pointer hover:bg-[rgba(245,240,232,0.02)] transition-colors"
                      onClick={() => setExpandedCampaign(isExpanded ? null : camp.id)}
                    >
                      {/* Cover */}
                      <div className="w-14 h-20 rounded-lg bg-[#2E2E35] flex items-center justify-center shrink-0 overflow-hidden">
                        {camp.bookCoverUrl ? (
                          <img src={camp.bookCoverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-[#9B9589]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#F5F0E8] truncate">{camp.bookTitle}</h3>
                          <StatusBadge status={camp.campaignStatus} />
                        </div>
                        <p className="text-xs text-[#9B9589] mt-0.5">{camp.bookAuthor || "Unknown Author"}</p>
                        <p className="text-[11px] text-[#9B9589] mt-1 truncate">{camp.associatedUrl}</p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[11px] text-[#9B9589]">
                        <span>{new Date(camp.generatedAt).toLocaleDateString()}</span>
                        <span>Staff #{camp.createdBy}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExportPdf(camp.id); }}
                          disabled={exportPdfMutation.isPending}
                          className="p-2 rounded-lg text-[#9B9589] hover:text-[#C8A55C] hover:bg-[rgba(200,165,92,0.08)] transition-all"
                          title="Export PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-[#9B9589] hover:text-[#F5F0E8] hover:bg-[rgba(245,240,232,0.04)] transition-all">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t border-[rgba(245,240,232,0.06)] p-4 bg-[rgba(245,240,232,0.02)]">
                        <CampaignDetailPanel
                          campaignId={camp.id}
                          onPush={(platform) => handlePush(camp.id, platform)}
                          pushing={pushingCampaign === camp.id}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========== GENERATE TAB ========== */}
      {activeTab === "generate" && (
        <div className="max-w-2xl">
          <div className="bg-[#232328] rounded-2xl border border-[rgba(245,240,232,0.06)] p-6">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#C8A55C]" /> Generate Campaign
            </h2>
            <p className="text-[#9B9589] text-sm mb-6">Creates an encrypted campaign asset bundle. One marketing credit will be debited.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Client ID *</label>
                  <input
                    type="text"
                    value={genForm.clientId}
                    onChange={(e) => setGenForm({ ...genForm, clientId: e.target.value })}
                    placeholder="user_123"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Platform</label>
                  <select
                    value={genForm.platform}
                    onChange={(e) => setGenForm({ ...genForm, platform: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] focus:outline-none focus:border-[#C8A55C] transition-colors"
                  >
                    <option value="mixed">Mixed (All)</option>
                    <option value="google">Google Ads</option>
                    <option value="meta">Meta</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Target URL *</label>
                <input
                  type="url"
                  value={genForm.targetUrl}
                  onChange={(e) => setGenForm({ ...genForm, targetUrl: e.target.value })}
                  placeholder="https://virtuspublishing.us/store/123"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Book Title *</label>
                  <input
                    type="text"
                    value={genForm.bookTitle}
                    onChange={(e) => setGenForm({ ...genForm, bookTitle: e.target.value })}
                    placeholder="The Great Adventure"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Book Author</label>
                  <input
                    type="text"
                    value={genForm.bookAuthor}
                    onChange={(e) => setGenForm({ ...genForm, bookAuthor: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">UGC Video Script</label>
                <textarea
                  value={genForm.ugcScript}
                  onChange={(e) => setGenForm({ ...genForm, ugcScript: e.target.value })}
                  placeholder="Optional: script for user-generated content video ad..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Ad Headlines</label>
                <textarea
                  value={genForm.adHeadlines}
                  onChange={(e) => setGenForm({ ...genForm, adHeadlines: e.target.value })}
                  placeholder="Optional: custom ad headlines separated by newlines..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full btn-gold py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generateMutation.isPending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Generate Campaign (-1 Credit)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== LEDGER TAB ========== */}
      {activeTab === "ledger" && (
        <div className="max-w-xl">
          <div className="bg-[#232328] rounded-2xl border border-[rgba(245,240,232,0.06)] p-6">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-[#C8A55C]" /> Client Ledger
            </h2>
            <p className="text-[#9B9589] text-sm mb-6">Check marketing credit balance for any client.</p>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={ledgerClientId}
                onChange={(e) => setLedgerClientId(e.target.value)}
                placeholder="Enter client ID..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
              />
              <button
                onClick={() => utils.adgpt.ledger.invalidate()}
                className="px-4 py-2.5 rounded-lg bg-[#2E2E35] text-[#F5F0E8] text-sm font-medium hover:bg-[#3a3a42] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {ledgerQuery.data && (
              <div className="bg-[#1A1A1F] rounded-xl p-5 border border-[rgba(245,240,232,0.06)]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-[#C8A55C]">{ledgerQuery.data.credits}</p>
                    <p className="text-[11px] text-[#9B9589] mt-1">Marketing Credits</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#F5F0E8] uppercase">{ledgerQuery.data.tier}</p>
                    <p className="text-[11px] text-[#9B9589] mt-1">Subscription Tier</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#9B9589]">
                      {ledgerQuery.data.lastDebit ? new Date(ledgerQuery.data.lastDebit).toLocaleDateString() : "Never"}
                    </p>
                    <p className="text-[11px] text-[#9B9589] mt-1">Last Debit</p>
                  </div>
                </div>

                {ledgerQuery.data.credits === 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-[rgba(194,112,112,0.08)] border border-[rgba(194,112,112,0.15)] flex items-center gap-2 text-[#C27070] text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Client has zero credits. They need to upgrade their subscription.
                  </div>
                )}
              </div>
            )}

            {ledgerQuery.isLoading && (
              <div className="text-center py-8 text-[#9B9589]">Loading ledger...</div>
            )}
          </div>
        </div>
      )}

      {/* ========== CONNECTORS TAB ========== */}
      {activeTab === "connectors" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked platforms */}
          <div className="bg-[#232328] rounded-2xl border border-[rgba(245,240,232,0.06)] p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#C8A55C]" /> Linked Platforms
            </h2>

            <div className="space-y-3">
              {["google_ads", "meta", "tiktok"].map((platform) => {
                const linked = integrations.find((i) => i.platform === platform);
                return (
                  <div
                    key={platform}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1F] border border-[rgba(245,240,232,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={platform} />
                      <div>
                        <p className="font-medium text-[#F5F0E8]">{platformLabel(platform)}</p>
                        <p className="text-[11px] text-[#9B9589]">
                          {linked ? `Linked ${new Date(linked.linkedAt).toLocaleDateString()}` : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {linked ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-[#6ADD92]">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                        <button
                          onClick={() => disconnectMutation.mutate({ staffId: String(user?.id), platform: platform as any })}
                          className="p-1.5 rounded-lg text-[#C27070] hover:bg-[rgba(194,112,112,0.08)] transition-all"
                          title="Disconnect"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#9B9589] px-2 py-1 rounded-md bg-[rgba(245,240,232,0.04)]">Not linked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add credentials form */}
          <div className="bg-[#232328] rounded-2xl border border-[rgba(245,240,232,0.06)] p-6">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C8A55C]" /> Link Credentials
            </h2>
            <p className="text-[#9B9589] text-sm mb-6">Connect ad platform APIs. Credentials are encrypted with AES-256-GCM.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Staff ID</label>
                <input
                  type="text"
                  value={credForm.staffId}
                  onChange={(e) => setCredForm({ ...credForm, staffId: e.target.value })}
                  placeholder={`${user?.id || "your_staff_id"}`}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Platform</label>
                <select
                  value={credForm.platform}
                  onChange={(e) => setCredForm({ ...credForm, platform: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] focus:outline-none focus:border-[#C8A55C] transition-colors"
                >
                  <option value="google_ads">Google Ads</option>
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="tiktok">TikTok Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Access Token *</label>
                <input
                  type="password"
                  value={credForm.accessToken}
                  onChange={(e) => setCredForm({ ...credForm, accessToken: e.target.value })}
                  placeholder="OAuth access token"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">Refresh Token</label>
                <input
                  type="password"
                  value={credForm.refreshToken}
                  onChange={(e) => setCredForm({ ...credForm, refreshToken: e.target.value })}
                  placeholder="OAuth refresh token (optional)"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9B9589] mb-1.5">
                  {credForm.platform === "tiktok" ? "Advertiser ID" : "Account ID / Customer ID"} *
                </label>
                <input
                  type="text"
                  value={credForm.accountId}
                  onChange={(e) => setCredForm({ ...credForm, accountId: e.target.value })}
                  placeholder={credForm.platform === "google_ads" ? "123-456-7890" : credForm.platform === "meta" ? "act_123456789" : "advertiser_id"}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-sm text-[#F5F0E8] placeholder:text-[#9B9589] focus:outline-none focus:border-[#C8A55C] transition-colors"
                />
              </div>

              <button
                onClick={handleLinkCredentials}
                disabled={linkCredsMutation.isPending}
                className="w-full btn-gold py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {linkCredsMutation.isPending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Linking...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Encrypt & Save Credentials</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-[rgba(245,240,232,0.08)] text-[#9B9589]",
    scheduled: "bg-[rgba(200,165,92,0.12)] text-[#C8A55C]",
    running: "bg-[rgba(74,222,128,0.12)] text-[#6ADD92]",
    paused: "bg-[rgba(194,112,112,0.08)] text-[#C27070]",
    completed: "bg-[rgba(100,149,237,0.12)] text-[#6495ED]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const className = "w-5 h-5";
  switch (platform) {
    case "google_ads": return <ExternalLink className={`${className} text-[#4285F4]`} />;
    case "meta": return <ExternalLink className={`${className} text-[#1877F2]`} />;
    case "tiktok": return <ExternalLink className={`${className} text-[#69C9D0]`} />;
    default: return <ExternalLink className={`${className} text-[#9B9589]`} />;
  }
}

function platformLabel(p: string) {
  if (p === "google_ads") return "Google Ads";
  if (p === "meta") return "Meta Ads";
  if (p === "tiktok") return "TikTok Ads";
  return p;
}

function CampaignDetailPanel({ campaignId, onPush, pushing }: { campaignId: string; onPush: (p: "google_ads" | "meta" | "tiktok") => void; pushing: boolean }) {
  const analyticsQuery = trpc.adgpt.analytics.useQuery({ recordId: campaignId });

  if (analyticsQuery.isLoading) {
    return <div className="text-center py-4 text-[#9B9589]">Loading campaign details...</div>;
  }

  const data = analyticsQuery.data;
  if (!data || data.error) {
    return <div className="text-center py-4 text-[#C27070]">Failed to load campaign details.</div>;
  }

  const payload = data.decryptedPayload as any;

  return (
    <div className="space-y-4">
      {/* Keywords */}
      {payload?.keywords && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A55C] mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {(payload.keywords as string[]).slice(0, 20).map((kw: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-[rgba(200,165,92,0.08)] text-[#C8A55C] text-[11px] font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* UGC Script */}
      {payload?.ugcScript && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A55C] mb-2">UGC Script</h4>
          <p className="text-sm text-[#9B9589] whitespace-pre-wrap bg-[#1A1A1F] p-3 rounded-lg">{payload.ugcScript}</p>
        </div>
      )}

      {/* Ad Headlines */}
      {payload?.adHeadlines && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A55C] mb-2">Ad Headlines</h4>
          <p className="text-sm text-[#9B9589] whitespace-pre-wrap bg-[#1A1A1F] p-3 rounded-lg">{payload.adHeadlines}</p>
        </div>
      )}

      {/* Platform targeting */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A55C] mb-2">Platform Targeting</h4>
        <p className="text-sm text-[#9B9589]">Primary: <span className="text-[#F5F0E8] font-medium capitalize">{payload?.platform || "mixed"}</span></p>
      </div>

      {/* Push actions */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A55C] mb-2">Push to Platform</h4>
        <div className="flex gap-2">
          {(["google_ads", "meta", "tiktok"] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => onPush(platform)}
              disabled={pushing || data.campaignStatus === "running"}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1F] border border-[rgba(245,240,232,0.08)] text-[#9B9589] text-xs font-medium hover:border-[#C8A55C] hover:text-[#C8A55C] transition-all disabled:opacity-40"
            >
              <Play className="w-3 h-3" />
              {platformLabel(platform)}
            </button>
          ))}
        </div>
        {pushing && <p className="text-[11px] text-[#C8A55C] mt-2 animate-pulse">Pushing campaign...</p>}
      </div>
    </div>
  );
}
