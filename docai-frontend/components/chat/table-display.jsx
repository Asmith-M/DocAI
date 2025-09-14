"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

export function TableDisplay({ tables, isLoading }) {
  const [expandedTables, setExpandedTables] = useState(new Set())

  const toggleTable = (tableId) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId)
    } else {
      newExpanded.add(tableId)
    }
    setExpandedTables(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 text-lavender-500 animate-spin mr-2" />
        <span className="text-gray-600 dark:text-gray-300">Loading tables...</span>
      </div>
    )
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Table className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No tables found in this document</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Table className="w-5 h-5 text-peach-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tables ({tables.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tables.map((table, index) => (
          <motion.div
            key={table.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <button
              onClick={() => toggleTable(table.id || index)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-peach-100 dark:bg-peach-900/20 rounded-lg flex items-center justify-center">
                  <Table className="w-4 h-4 text-peach-600 dark:text-peach-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Table {index + 1}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {table.rows?.length || 0} rows × {table.columns?.length || 0} columns
                  </p>
                </div>
              </div>
              {expandedTables.has(table.id || index) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedTables.has(table.id || index) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {table.columns?.map((column, colIndex) => (
                            <th
                              key={colIndex}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {table.rows?.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
