"use client"

import { useState } from "react"
import { Tag, Heart } from "lucide-react"

export function VersionBadge({ version = "V1.0", position = "bottom-right" }) {
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4"
      case "top-right":
        return "top-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      case "bottom-right":
      default:
        return "bottom-4 right-4"
    }
  }

  const handleEasterEgg = () => {
    setShowEasterEgg(true)
    setTimeout(() => setShowEasterEgg(false), 3000)
  }

  // Listen for easter egg trigger
  useState(() => {
    const handleEasterEggTrigger = () => {
      handleEasterEgg()
    }

    window.addEventListener("trigger-easter-egg", handleEasterEggTrigger)
    return () => window.removeEventListener("trigger-easter-egg", handleEasterEggTrigger)
  }, [])

  return (
    <>
      <div className={`fixed ${getPositionClasses()} z-40`}>
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 shadow-lg">
          <Tag className="w-4 h-4 text-lavender-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{version}</span>
        </div>
      </div>

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4 text-center animate-bounce-in">
            <div className="w-16 h-16 bg-gradient-to-br from-lavender-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Built with 💜 by Team DocAI</h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thanks for discovering our little secret! We hope you're enjoying DocAI.
            </p>

            <div className="text-sm text-lavender-600 dark:text-lavender-400">
              Version {version} • Made with love and lots of coffee ☕
            </div>
          </div>
        </div>
      )}
    </>
  )
}
