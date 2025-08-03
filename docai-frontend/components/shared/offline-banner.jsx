"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WifiOff, RefreshCw } from "lucide-react"

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      setShowBanner(!online)
    }

    // Initial check
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    // Simulate retry action
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: "Checking connection..." },
      }),
    )

    setTimeout(() => {
      if (navigator.onLine) {
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { type: "success", message: "Connection restored!" },
          }),
        )
      } else {
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { type: "error", message: "Still offline. Please check your connection." },
          }),
        )
      }
    }, 1000)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WifiOff className="w-5 h-5" />
                <div>
                  <p className="font-medium">You're currently offline</p>
                  <p className="text-sm opacity-90">Some features may not work properly</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Retry</span>
                </button>

                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <span className="sr-only">Dismiss</span>×
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
