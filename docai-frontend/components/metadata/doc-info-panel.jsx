"use client"

import { useState } from "react"
import { X, FileText, Calendar, HardDrive, Cpu, Clock } from "lucide-react"

export function DocInfoPanel({ isOpen, onClose }) {
  const [documentInfo] = useState({
    filename: "Contract_Agreement_2024.pdf",
    pages: 24,
    size: "2.4 MB",
    uploadTimestamp: "2024-01-15T10:30:00Z",
    modelUsed: "GPT-4 Turbo",
    processingTime: "3.2s",
    language: "English",
    wordCount: 8420,
    lastAccessed: "2024-01-15T14:22:00Z",
  })

  if (!isOpen) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document Metadata</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close metadata panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              File Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-lavender-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{documentInfo.filename}</p>
                  <p className="text-xs text-gray-500">Filename</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{documentInfo.pages} pages</p>
                    <p className="text-xs text-gray-500">Page count</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{documentInfo.size}</p>
                    <p className="text-xs text-gray-500">File size</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Processing Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{documentInfo.modelUsed}</p>
                  <p className="text-xs text-gray-500">AI Model</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{documentInfo.processingTime}</p>
                    <p className="text-xs text-gray-500">Processing time</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {documentInfo.wordCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Word count</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(documentInfo.uploadTimestamp)}
                  </p>
                  <p className="text-xs text-gray-500">Uploaded</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(documentInfo.lastAccessed)}
                  </p>
                  <p className="text-xs text-gray-500">Last accessed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Language: {documentInfo.language}</p>
              <p className="text-xs text-gray-500">Detected language</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
