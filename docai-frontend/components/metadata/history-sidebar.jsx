"use client"

import { useState } from "react"
import { X, Search, FileText, Calendar, Filter } from "lucide-react"

export function HistorySidebar({ isOpen, onToggle, onDocumentSelect }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const [documents] = useState([
    {
      id: 1,
      filename: "Contract_Agreement_2024.pdf",
      uploadDate: "2024-01-15T10:30:00Z",
      size: "2.4 MB",
      pages: 24,
      summary: "Legal contract with terms and conditions for service agreement",
      type: "contract",
    },
    {
      id: 2,
      filename: "Financial_Report_Q4.pdf",
      uploadDate: "2024-01-14T15:22:00Z",
      size: "1.8 MB",
      pages: 18,
      summary: "Quarterly financial performance and analysis report",
      type: "report",
    },
    {
      id: 3,
      filename: "User_Manual_v2.pdf",
      uploadDate: "2024-01-13T09:15:00Z",
      size: "3.2 MB",
      pages: 45,
      summary: "Comprehensive user guide and documentation",
      type: "manual",
    },
    {
      id: 4,
      filename: "Meeting_Minutes_Jan.pdf",
      uploadDate: "2024-01-12T14:45:00Z",
      size: "0.8 MB",
      pages: 6,
      summary: "Board meeting minutes and action items",
      type: "meeting",
    },
  ])

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTypeColor = (type) => {
    const colors = {
      contract: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      report: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      manual: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      meeting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="section-title">Document History</h2>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close history sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="contract">Contracts</option>
              <option value="report">Reports</option>
              <option value="manual">Manuals</option>
              <option value="meeting">Meetings</option>
            </select>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onDocumentSelect?.(doc)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.filename}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(doc.type)}`}>{doc.type}</span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{doc.summary}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(doc.uploadDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{doc.pages} pages</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No documents match your search" : "No documents found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
