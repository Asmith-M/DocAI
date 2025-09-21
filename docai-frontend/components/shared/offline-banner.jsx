"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WifiOff, RefreshCw, CheckCircle, AlertTriangle, Server } from "lucide-react"
import { getOfflineStatus } from "../../lib/api"

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [offlineStatus, setOfflineStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkOfflineStatus = async () => {
    try {
      setLoading(true)
      const status = await getOfflineStatus()
      setOfflineStatus(status)
    } catch (error) {
      console.error("Failed to check offline status:", error)
      setOfflineStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      setShowBanner(!online)
    }

    // Initial check
    updateOnlineStatus()
    checkOfflineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Check offline status periodically
    const statusInterval = setInterval(checkOfflineStatus, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      clearInterval(statusInterval)
    }
  }, [])

  const handleRetry = async () => {
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: "Checking connection and offline status..." },
      }),
    )

    await checkOfflineStatus()

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

  const getStatusColor = () => {
    if (!offlineStatus) return "bg-red-500"

    const { ollama, embedding_service, chroma, ocr } = offlineStatus

    // Check if all components are healthy
    const ollamaHealthy = ollama?.healthy && ollama?.model_loaded
    const embeddingHealthy = embedding_service?.model_loaded
    const chromaHealthy = chroma?.chroma_persist_dir_exists
    const ocrHealthy = ocr?.pymupdf_available || ocr?.tesseract_available || ocr?.easyocr_available

    if (ollamaHealthy && embeddingHealthy && chromaHealthy && ocrHealthy) {
      return "bg-green-500"
    } else if (ollamaHealthy || embeddingHealthy || chromaHealthy || ocrHealthy) {
      return "bg-yellow-500"
    } else {
      return "bg-red-500"
    }
  }

  const getStatusIcon = () => {
    if (!offlineStatus) return <WifiOff className="w-5 h-5" />

    const { ollama, embedding_service, chroma, ocr } = offlineStatus

    const ollamaHealthy = ollama?.healthy && ollama?.model_loaded
    const embeddingHealthy = embedding_service?.model_loaded
    const chromaHealthy = chroma?.chroma_persist_dir_exists
    const ocrHealthy = ocr?.pymupdf_available || ocr?.tesseract_available || ocr?.easyocr_available

    if (ollamaHealthy && embeddingHealthy && chromaHealthy && ocrHealthy) {
      return <CheckCircle className="w-5 h-5" />
    } else if (ollamaHealthy || embeddingHealthy || chromaHealthy || ocrHealthy) {
      return <AlertTriangle className="w-5 h-5" />
    } else {
      return <Server className="w-5 h-5" />
    }
  }

  const getStatusMessage = () => {
    if (!offlineStatus) {
      return {
        title: "Offline Status Unknown",
        subtitle: "Unable to check offline component status"
      }
    }

    const { ollama, embedding_service, chroma, ocr } = offlineStatus

    const ollamaHealthy = ollama?.healthy && ollama?.model_loaded
    const embeddingHealthy = embedding_service?.model_loaded
    const chromaHealthy = chroma?.chroma_persist_dir_exists
    const ocrHealthy = ocr?.pymupdf_available || ocr?.tesseract_available || ocr?.easyocr_available

    if (ollamaHealthy && embeddingHealthy && chromaHealthy && ocrHealthy) {
      return {
        title: "Fully Offline Ready",
        subtitle: "All components are configured for offline operation"
      }
    } else if (ollamaHealthy || embeddingHealthy || chromaHealthy || ocrHealthy) {
      return {
        title: "Partially Offline Ready",
        subtitle: "Some components are configured for offline operation"
      }
    } else {
      return {
        title: "Offline Components Not Ready",
        subtitle: "Configure offline components for full functionality"
      }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-50 text-white shadow-lg ${getStatusColor()}`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">{statusMessage.title}</p>
                  <p className="text-sm opacity-90">{statusMessage.subtitle}</p>
                  {offlineStatus && (
                    <div className="text-xs opacity-75 mt-1">
                      Ollama: {offlineStatus.ollama?.healthy && offlineStatus.ollama?.model_loaded ? "✓" : "✗"} |
                      Embeddings: {offlineStatus.embedding_service?.model_loaded ? "✓" : "✗"} |
                      Chroma: {offlineStatus.chroma?.chroma_persist_dir_exists ? "✓" : "✗"} |
                      OCR: {offlineStatus.ocr?.pymupdf_available || offlineStatus.ocr?.tesseract_available || offlineStatus.ocr?.easyocr_available ? "✓" : "✗"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Refresh</span>
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
