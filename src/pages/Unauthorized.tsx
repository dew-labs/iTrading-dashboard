import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, Home, ArrowLeft, Mail } from 'lucide-react'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
            <ShieldOff className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>

          <p className="text-gray-500">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors shadow-sm font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
          </div>
          <p className="text-gray-600">
            Contact your system administrator or reach out to{' '}
            <a
              href="mailto:support@example.com"
              className="text-gray-900 underline hover:text-gray-700 transition-colors font-medium"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
