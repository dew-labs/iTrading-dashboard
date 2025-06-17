import React, { useState } from 'react'
import { AlertCircle, X, ExternalLink } from 'lucide-react'

const DemoNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  const isDemo = import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') ||
                 !import.meta.env.VITE_SUPABASE_URL ||
                 import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co'

  if (!isDemo || !isVisible) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-amber-700">
            <strong>Demo Mode:</strong> This dashboard is running in demo mode. To enable full functionality,
            please set up your Supabase project and configure the environment variables.
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 text-amber-800 hover:text-amber-900 underline"
            >
              Get started with Supabase
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md bg-amber-50 p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-amber-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoNotice
