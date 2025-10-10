"use client"

import { motion } from "framer-motion"
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function DocumentHistoryItem({ document, index, onSelect }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "border-l-green-500"
      case "processing":
        return "border-l-yellow-500"
      case "error":
        return "border-l-red-500"
      default:
        return "border-l-gray-300"
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={() => onSelect(document)}
      className={`w-full p-3 text-left rounded-lg border-l-4 ${getStatusColor(
        document.status,
      )} bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group`}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {document.name}
            </h4>
            {getStatusIcon(document.status)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{document.pages} pages</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                {document.language}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Last accessed {document.lastAccessed}</p>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
