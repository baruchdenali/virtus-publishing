import { Link } from 'react-router'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <BookOpen className="w-16 h-16 text-[#9B9589] mb-6 opacity-50" />
      <h1 className="text-[48px] font-semibold text-[#F5F0E8] mb-2">404</h1>
      <h2 className="text-[20px] font-semibold mb-2">Page Not Found</h2>
      <p className="text-[14px] text-[#9B9589] max-w-md mb-8">
        The page you are looking for does not exist or has been moved. 
        Check the URL or navigate back to the home page.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 btn-gold text-[13px]">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  )
}
