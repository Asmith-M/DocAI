"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Table, FileText, CheckCircle, Loader2 } from "lucide-react"
import { TableDisplay } from "./table-display"
import { ChunkDisplay } from "./chunk-display"
import { EmbeddingControls } from "./embedding-controls"

export function DocumentDataPanel({ selectedDocument, tables, chunks }) {
  const [activeTab, setActiveTab] = useState("tables")
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)

  useEffect(() => {
    if (selectedDocument) {
      setIsLoadingTables(true)
      setIsLoadingChunks(true)

      // Simulate loading (in real app, this would be handled by the API calls)
      const timer = setTimeout(() => {
        setIsLoadingTables(false)
        setIsLoadingChunks(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [selectedDocument])

  if (!selectedDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Document Selected
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select a document from the history to view its tables and chunks
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Document Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-lavender-100 dark:bg-lavender-900/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedDocument.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDocument.pages} pages • {selectedDocument.uploadDate}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2">
          {chunks && chunks.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 px-2 py-1 bg-mint-100 dark:bg-mint-900/20 rounded-full"
            >
              <CheckCircle className="w-3 h-3 text-mint-600 dark:text-mint-400" />
              <span className="text-xs font-medium text-mint-700 dark:text-mint-300">
                Chunks Ready
              </span>
            </motion.div>
          )}
          {tables && tables.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-1 px-2 py-1 bg-peach-100 dark:bg-peach-900/20 rounded-full"
            >
              <Table className="w-3 h-3 text-peach-600 dark:text-peach-400" />
              <span className="text-xs font-medium text-peach-700 dark:text-peach-300">
                Tables ({tables.length})
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("tables")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "tables"
              ? "text-lavender-600 dark:text-lavender-400 border-b-2 border-lavender-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Table className="w-4 h-4" />
            <span>Tables</span>
            {tables && tables.length > 0 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {tables.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab("chunks")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "chunks"
              ? "text-lavender-600 dark:text-lavender-400 border-b-2 border-lavender-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Chunks</span>
            {chunks && chunks.length > 0 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {chunks.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "tables" && (
          <div className="h-full overflow-y-auto p-4">
            <TableDisplay tables={tables} isLoading={isLoadingTables} />
          </div>
        )}
        {activeTab === "chunks" && (
          <div className="h-full overflow-y-auto p-4">
            <ChunkDisplay chunks={chunks} isLoading={isLoadingChunks} />
          </div>
        )}
      </div>

      {/* Embedding Controls */}
      <EmbeddingControls selectedDocument={selectedDocument} />
    </div>
  )
}
