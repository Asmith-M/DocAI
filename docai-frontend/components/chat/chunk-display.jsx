"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

export function ChunkDisplay({ chunks, isLoading }) {
  const [expandedChunks, setExpandedChunks] = useState(new Set())

  const toggleChunk = (chunkId) => {
    const newExpanded = new Set(expandedChunks)
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId)
    } else {
      newExpanded.add(chunkId)
    }
    setExpandedChunks(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 text-lavender-500 animate-spin mr-2" />
        <span className="text-gray-600 dark:text-gray-300">Loading chunks...</span>
      </div>
    )
  }

  if (!chunks || chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No chunks found in this document</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-mint-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chunks ({chunks.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {chunks.map((chunk, index) => (
          <motion.div
            key={chunk.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <button
              onClick={() => toggleChunk(chunk.id || index)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-mint-100 dark:bg-mint-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-mint-600 dark:text-mint-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Chunk {index + 1}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chunk.content?.length || 0} characters • Page {chunk.page_number || 'N/A'}
                  </p>
                </div>
              </div>
              {expandedChunks.has(chunk.id || index) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedChunks.has(chunk.id || index) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chunk.content}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Page: {chunk.page_number || 'N/A'}</span>
                      <span>Position: {chunk.chunk_index || index + 1}</span>
                      {chunk.metadata && (
                        <span>Metadata: {Object.keys(chunk.metadata).length} fields</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
