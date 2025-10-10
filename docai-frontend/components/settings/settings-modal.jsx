"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Settings, Save, RotateCcw } from "lucide-react"
import { LanguageSelector } from "./language-selector"
import { ThemeToggle } from "./theme-toggle"
import { ModelSwitcher } from "./model-switcher"
import { DocViewToggle } from "./doc-view-toggle"
import { ProfileSync } from "./profile-sync"
import { UsageStats } from "./usage-stats"
import { ImportExport } from "./import-export"
import { ARIAButton } from "@/components/shared/aria-button"
import { ResetConfirmationModal } from "./reset-confirmation-modal"

export function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    language: "en",
    model: "mistral-7b",
    docViewMode: "pdf-viewer",
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [changeCount, setChangeCount] = useState(0)
  const [showResetModal, setShowResetModal] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = {
      language: localStorage.getItem("language") || "en",
      model: localStorage.getItem("aiModel") || "mistral-7b",
      docViewMode: localStorage.getItem("docViewMode") || "pdf-viewer",
    }
    setSettings(savedSettings)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose()
      } else if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handleSave()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setChangeCount((prev) => prev + 1)
  }

  const handleSave = () => {
    // Save to localStorage
    Object.entries(settings).forEach(([key, value]) => {
      if (key === "model") {
        localStorage.setItem("aiModel", value)
      } else {
        localStorage.setItem(key, value)
      }
    })

    setHasChanges(false)

    // Show success toast
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Settings saved successfully!" },
      }),
    )

    // Trigger confetti if 3+ changes
    if (changeCount >= 3) {
      window.dispatchEvent(
        new CustomEvent("trigger-confetti", {
          detail: { source: "settings" },
        }),
      )
      setChangeCount(0)
    }
  }

  const handleReset = () => {
    const defaultSettings = {
      language: "en",
      model: "mistral-7b",
      docViewMode: "pdf-viewer",
    }
    setSettings(defaultSettings)
    setHasChanges(true)

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: "Settings reset to defaults" },
      }),
    )
  }

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
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize your Noetic Vault experience</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Settings */}
                <div className="space-y-6">
                  <LanguageSelector value={settings.language} onChange={(value) => updateSetting("language", value)} />
                  <ThemeToggle />
                  <ModelSwitcher value={settings.model} onChange={(value) => updateSetting("model", value)} />
                </div>

                {/* Additional Settings */}
                <div className="space-y-6">
                  <DocViewToggle
                    value={settings.docViewMode}
                    onChange={(value) => updateSetting("docViewMode", value)}
                  />
                  <ProfileSync />
                  <UsageStats />
                </div>
              </div>

              {/* Import/Export Section */}
              <div className="mt-6">
                <ImportExport settings={settings} onImport={setSettings} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center space-x-3">
                <ARIAButton
                  variant="ghost"
                  onClick={() => setShowResetModal(true)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </ARIAButton>
              </div>

              <div className="flex items-center space-x-3">
                <ARIAButton
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                >
                  Cancel
                </ARIAButton>
                <ARIAButton
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`${
                    hasChanges
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </ARIAButton>
              </div>
            </div>
            <ResetConfirmationModal
              isOpen={showResetModal}
              onClose={() => setShowResetModal(false)}
              onConfirm={() => {
                handleReset()
                setShowResetModal(false)
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
