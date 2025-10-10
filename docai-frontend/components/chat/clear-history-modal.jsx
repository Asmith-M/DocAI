"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, AlertTriangle } from "lucide-react"
import { ARIAButton } from "@/components/shared/aria-button"

export function ClearHistoryModal({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="section-title">Clear History</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to clear your document history? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All document references and chat contexts will be removed from your history.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <ARIAButton
                variant="ghost"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
              >
                Cancel
              </ARIAButton>
              <ARIAButton onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </ARIAButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
