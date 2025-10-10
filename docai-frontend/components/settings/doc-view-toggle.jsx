"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, List, Eye } from "lucide-react"

export function DocViewToggle({ value, onChange }) {
  const [lastUsed, setLastUsed] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("docViewMode")
    if (saved) {
      setLastUsed(saved)
    }
  }, [])

  useEffect(() => {
    if (value) {
      localStorage.setItem("docViewMode", value)
      setLastUsed(value)
    }
  }, [value])

  const viewModes = [
    {
      id: "pdf-viewer",
      name: "PDF Viewer",
      description: "View documents as PDF",
      icon: FileText,
      preview: (
        <div className="w-full h-16 bg-red-100 dark:bg-red-900/20 rounded border-2 border-red-200 dark:border-red-800 flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-500" />
        </div>
      ),
    },
    {
      id: "text-outline",
      name: "Text Outline",
      description: "View as structured text",
      icon: List,
      preview: (
        <div className="w-full h-16 bg-blue-100 dark:bg-blue-900/20 rounded border-2 border-blue-200 dark:border-blue-800 p-2">
          <div className="space-y-1">
            <div className="h-2 bg-blue-300 dark:bg-blue-600 rounded w-3/4"></div>
            <div className="h-2 bg-blue-300 dark:bg-blue-600 rounded w-1/2"></div>
            <div className="h-2 bg-blue-300 dark:bg-blue-600 rounded w-2/3"></div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
          <Eye className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
        </div>
        <div>
          <h3 className="section-title">Document View Mode</h3>
          <p className="section-subtitle">Choose how to display documents</p>
        </div>
      </div>

      {/* Last Used Badge */}
      {lastUsed && (
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300">
            Last used: {viewModes.find((mode) => mode.id === lastUsed)?.name}
          </span>
        </div>
      )}

      {/* View Mode Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viewModes.map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(mode.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all group ${
              value === mode.id
                ? "border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-lavender-300 dark:hover:border-lavender-400"
            }`}
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-lavender-100 dark:group-hover:bg-lavender-900/30 transition-colors">
                <mode.icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-lavender-600 dark:group-hover:text-lavender-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{mode.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="relative overflow-hidden">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                {mode.preview}
              </motion.div>
            </div>

            {/* Selection Indicator */}
            {value === mode.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-4 h-4 bg-lavender-500 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
