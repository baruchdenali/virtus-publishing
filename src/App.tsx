import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import Store from './pages/Store'
import BookDetail from './pages/BookDetail'
import Dashboard from './pages/Dashboard'
import CreateEbook from './pages/CreateEbook'
import Editor from './pages/Editor'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import Events from './pages/Events'
import Blog from './pages/Blog'
import Podcast from './pages/Podcast'
import BlogEditor from './pages/BlogEditor'
import PodcastManager from './pages/PodcastManager'
import Pricing from './pages/Pricing'
import Packages from './pages/Packages'
import HelpCenter from './pages/HelpCenter'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import SocialMediaAgent from './pages/SocialMediaAgent'
import MarketingAgent from './pages/MarketingAgent'
import SalesDashboard from './pages/SalesDashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import KnowledgeBase from './pages/KnowledgeBase'
import KBArticle from './pages/KBArticle'
import AdGPTDashboard from './pages/AdGPTDashboard'
import NotFound from './pages/NotFound'
import AppShell from './components/AppShell'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/store/:id" element={<BookDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateEbook />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/admin/blog" element={<BlogEditor />} />
        <Route path="/admin/podcast" element={<PodcastManager />} />
        <Route path="/admin/social-agent" element={<SocialMediaAgent />} />
        <Route path="/admin/marketing-agent" element={<MarketingAgent />} />
        <Route path="/admin/sales" element={<SalesDashboard />} />
        <Route path="/admin/operations" element={<OperationsDashboard />} />
        <Route path="/admin/adgpt" element={<AdGPTDashboard />} />
        <Route path="/kb" element={<KnowledgeBase />} />
        <Route path="/kb/:slug" element={<KBArticle />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
