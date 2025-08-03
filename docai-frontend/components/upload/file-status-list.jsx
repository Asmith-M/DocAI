"use client"

import { useState } from "react"
import { CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ARIAButton } from "@/components/shared/aria-button"

export function FileStatusList() {
  const [files] = useState([
    {
      id: 1,
      name: "Research Paper.pdf",
      status: "completed",
      uploadedAt: "2 minutes ago",
      pages: 24,
    },
    {
      id: 2,
      name: "User Manual.pdf",
      status: "processing",
      uploadedAt: "5 minutes ago",
      pages: 156,
    },
  ])

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Uploads</h3>

      {files.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.pages} pages • {file.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">{getStatusText(file.status)}</span>
                {file.status === "completed" && (
                  <Link href="/chat">
                    <ARIAButton className="bg-lavender-500 hover:bg-lavender-600 text-white px-4 py-2 text-sm">
                      Chat
                    </ARIAButton>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {files.some((f) => f.status === "completed") && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Link href="/chat">
            <ARIAButton className="w-full bg-lavender-500 hover:bg-lavender-600 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chatting with Your Documents
            </ARIAButton>
          </Link>
        </div>
      )}
    </motion.div>
  )
}
