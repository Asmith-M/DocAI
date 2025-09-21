"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Play, CheckCircle, AlertCircle, Loader2, Trash2, Settings } from "lucide-react"
import { generateEmbeddings, getEmbeddingStatus, deleteEmbeddings, getOfflineStatus } from "../../lib/api"

export function EmbeddingControls({ selectedDocument, onEmbeddingGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const [offlineStatus, setOfflineStatus] = useState(null)
  const [checkingOffline, setCheckingOffline] = useState(false)

  useEffect(() => {
    if (selectedDocument) {
      checkEmbeddingStatus()
    }
    checkOfflineStatus()
  }, [selectedDocument])

  const checkEmbeddingStatus = async () => {
    if (!selectedDocument?.documentId) return

    try {
      const statusData = await getEmbeddingStatus(selectedDocument.documentId)
      setStatus(statusData)
      setError(null)
    } catch (err) {
      setError(err.message)
      setStatus(null)
    }
  }

  const checkOfflineStatus = async () => {
    setCheckingOffline(true)
    try {
      const status = await getOfflineStatus()
      setOfflineStatus(status)
    } catch (err) {
      console.warn("Failed to check offline status:", err)
      setOfflineStatus(null)
    } finally {
      setCheckingOffline(false)
    }
  }

  const handleGenerateEmbeddings = async () => {
    if (!selectedDocument?.documentId) return

    setIsGenerating(true)
    setError(null)

    try {
      await generateEmbeddings(selectedDocument.documentId)
      setIsPolling(true)

      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await getEmbeddingStatus(selectedDocument.documentId)
          setStatus(statusData)

          if (statusData.status === "completed") {
            setIsPolling(false)
            clearInterval(pollInterval)
            onEmbeddingGenerated && onEmbeddingGenerated(statusData)
            window.dispatchEvent(
              new CustomEvent("show-toast", {
                detail: { type: "success", message: "Embeddings generated successfully!" },
              }),
            )
          } else if (statusData.status === "failed") {
            setIsPolling(false)
            clearInterval(pollInterval)
            setError("Embedding generation failed")
            window.dispatchEvent(
              new CustomEvent("show-toast", {
                detail: { type: "error", message: "Embedding generation failed" },
              }),
            )
          }
        } catch (err) {
          setIsPolling(false)
          clearInterval(pollInterval)
          setError(err.message)
        }
      }, 2000)

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setIsPolling(false)
        if (status?.status !== "completed") {
          setError("Embedding generation timed out")
        }
      }, 300000)

    } catch (err) {
      setError(err.message)
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "error", message: `Failed to start embedding generation: ${err.message}` },
        }),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteEmbeddings = async () => {
    if (!selectedDocument?.documentId) return

    try {
      await deleteEmbeddings(selectedDocument.documentId)
      setStatus(null)
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "success", message: "Embeddings deleted successfully" },
        }),
      )
    } catch (err) {
      setError(err.message)
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "error", message: `Failed to delete embeddings: ${err.message}` },
        }),
      )
    }
  }

  const getStatusIcon = () => {
    if (isGenerating || isPolling) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }

    switch (status?.status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
      default:
        return <Brain className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (isGenerating) return "Starting..."
    if (isPolling) return "Generating..."
    if (!status) return "Not generated"

    switch (status.status) {
      case "completed":
        return "Ready"
      case "processing":
        return "Processing..."
      case "failed":
        return "Failed"
      default:
        return "Not generated"
    }
  }

  const getStatusColor = () => {
    if (isGenerating || isPolling) return "text-blue-600 dark:text-blue-400"
    if (!status) return "text-gray-500 dark:text-gray-400"

    switch (status.status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "processing":
        return "text-yellow-600 dark:text-yellow-400"
      case "failed":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-500 dark:text-gray-400"
    }
  }

  if (!selectedDocument) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Embeddings
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Offline status warning */}
      {offlineStatus && !offlineStatus.ready && (
        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <span>Some offline components are not ready. Embedding generation may be limited.</span>
          </div>
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            {!offlineStatus.components?.embedding_service && "• Embedding service not ready"}
            {!offlineStatus.components?.chroma_persistence && "• Chroma persistence not ready"}
            {!offlineStatus.components?.ocr_engines && "• OCR engines not ready"}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <motion.button
          onClick={handleGenerateEmbeddings}
          disabled={isGenerating || isPolling || status?.status === "processing" || (offlineStatus && !offlineStatus.ready)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isGenerating || isPolling || status?.status === "processing" || (offlineStatus && !offlineStatus.ready)
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : isPolling ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : offlineStatus && !offlineStatus.ready ? (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Setup Required
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Generate Embeddings
            </>
          )}
        </motion.button>

        {status?.status === "completed" && (
          <motion.button
            onClick={handleDeleteEmbeddings}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {status?.status === "completed" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4" />
              <span>Embeddings ready for chat queries</span>
            </div>
            {status.chunks_processed && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Processed {status.chunks_processed} chunks
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
