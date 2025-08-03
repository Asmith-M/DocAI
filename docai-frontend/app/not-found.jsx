"use client"

import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
// CHANGE: Use the alias for ARIAButton import
import { ARIAButton } from "@/components/shared/aria-button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-lavender-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Oops! Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The page you're looking for seems to have wandered off into the digital void. Don't worry, even our AI gets
            lost sometimes! 🤖
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <ARIAButton className="w-full bg-lavender-500 hover:bg-lavender-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </ARIAButton>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 border border-lavender-300 text-lavender-600 hover:bg-lavender-50 dark:border-lavender-400 dark:text-lavender-400 dark:hover:bg-lavender-900/20 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}