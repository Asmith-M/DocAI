"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { ConfettiEffect } from "./confetti-effect"

export function Toasts() {
  const [toasts, setToasts] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const handleShowToast = (event) => {
      const { type, message, duration = 5000 } = event.detail

      const id = String(Date.now()) + Math.random()
      const newToast = { id, type, message, duration }

      setToasts((prev) => [...prev, newToast])

      // Show confetti for verified answers
      if (type === "verified") {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }

      // Auto remove toast
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }

    window.addEventListener("show-toast", handleShowToast)
    return () => window.removeEventListener("show-toast", handleShowToast)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
      case "verified":
        return CheckCircle
      case "error":
        return AlertCircle
      case "warning":
        return AlertTriangle
      case "info":
      default:
        return Info
    }
  }

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
      case "verified":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200"
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200"
    }
  }

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.type)

          return (
            <div
              key={toast.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-sm animate-slide-in-right ${getToastStyles(toast.type)}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
