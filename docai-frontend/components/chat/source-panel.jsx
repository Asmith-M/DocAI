"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function SourcePanel({ sources = [], matchedPhrases = [] }) {
  const [expandedSource, setExpandedSource] = useState(null)

  const toggleSource = (sourceId) => {
    setExpandedSource(expandedSource === sourceId ? null : sourceId)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sources</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Referenced content from your documents</p>
      </div>

      <div className="overflow-y-auto h-full pb-4">
        {sources.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No sources available</p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {sources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSource(source.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{source.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Page {source.page} • {source.relevance}% relevance
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{source.snippet}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {expandedSource === source.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedSource === source.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-600"
                    >
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{source.snippet}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Relevance: {source.relevance}%</div>
                          <button className="flex items-center space-x-1 text-xs text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300">
                            <span>View in document</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
