"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Keyboard } from "lucide-react"

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: "Enter", description: "Send message", category: "Chat" },
    { key: "Shift + Enter", description: "New line in message", category: "Chat" },
    { key: "Ctrl + K", description: "Clear chat history", category: "Chat" },
    { key: "Ctrl + /", description: "Show keyboard shortcuts", category: "General" },
    { key: "Esc", description: "Close modal or cancel action", category: "General" },
    { key: "Ctrl + U", description: "Go to upload page", category: "Navigation" },
    { key: "Ctrl + H", description: "Go to home page", category: "Navigation" },
    { key: "Ctrl + D", description: "Toggle dark mode", category: "General" },
  ]

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {})

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
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
                  <Keyboard className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
                </div>
                <h3 className="section-title">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {shortcuts.map((shortcut, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                          <div className="flex items-center space-x-1">
                            {shortcut.key.split(" + ").map((key, keyIndex) => (
                              <div key={keyIndex} className="flex items-center">
                                {keyIndex > 0 && <span className="text-gray-400 mx-1">+</span>}
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
                                  {key}
                                </kbd>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd> to close this
                modal
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
