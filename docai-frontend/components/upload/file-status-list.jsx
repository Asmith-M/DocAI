//docai-frontend/components/upload/file-status-list.jsx
"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ARIAButton } from "@/components/shared/aria-button"
import { listFiles } from "@/lib/api"

export function FileStatusList({ files = [], onRefresh }) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUploadedFiles = async () => {
    try {
      const response = await listFiles()
      setUploadedFiles(response.documents || [])
    } catch (error) {
      console.error("Failed to fetch uploaded files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  // Refresh when onRefresh is called (e.g., after upload)
  useEffect(() => {
    if (onRefresh) {
      fetchUploadedFiles()
    }
  }, [onRefresh])

  // Use provided files prop if available, otherwise use fetched files
  const displayFiles = files.length > 0 ? files : uploadedFiles
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "processed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
      case "processed":
        return "Ready to chat"
      case "processing":
        return "Processing..."
      case "error":
        return "Upload failed"
      default:
        return "Pending"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/85 backdrop-blur-lg dark:bg-gray-800/85 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Uploads</h3>

      {displayFiles.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayFiles.map((file, index) => (
            <motion.div
              key={`${file.documentId || file.document_id || file.id || index}-${file.filename || file.name}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{file.filename || file.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.pageCount || file.pages} pages • {file.uploadedAt || "Just now"}
                  </p>
                  {file.extractionMethod && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">Extraction: {file.extractionMethod}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(file.status)}</span>
                {(file.status === "completed" || file.status === "processed") && (
                  <Link to={`/chat?documentId=${file.documentId || file.document_id || file.id}`}>
                    <ARIAButton className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm">
                      Chat
                    </ARIAButton>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {displayFiles.some((f) => f.status === "completed" || f.status === "processed") && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link to={`/chat?documentId=${displayFiles.find(f => f.status === "completed" || f.status === "processed")?.documentId || displayFiles.find(f => f.status === "completed" || f.status === "processed")?.document_id || displayFiles.find(f => f.status === "completed" || f.status === "processed")?.id}`}>
            <ARIAButton className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chatting with Your Documents
            </ARIAButton>
          </Link>
        </div>
      )}
    </motion.div>
  )
}
