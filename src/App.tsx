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
import NotFound from './pages/NotFound'
import AppShell from './components/AppShell'

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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
