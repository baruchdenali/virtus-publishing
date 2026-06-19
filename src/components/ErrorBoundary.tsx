import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
          <AlertTriangle className="w-12 h-12 text-[#C27070] mb-4" />
          <h2 className="text-[20px] font-semibold mb-2 text-[#F5F0E8]">Something went wrong</h2>
          <p className="text-[13px] text-[#9B9589] mb-2 max-w-md">
            A component error occurred. This has been logged. Try refreshing the page.
          </p>
          {this.state.error && (
            <code className="text-[11px] text-[#C27070] bg-[rgba(194,112,112,0.08)] px-3 py-1.5 rounded-lg mb-6 max-w-lg truncate">
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={() => window.location.reload()}
            className="btn-gold text-[13px] flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
