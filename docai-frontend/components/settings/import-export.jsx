"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Upload, FileJson, Copy } from "lucide-react"

export function ImportExport({ settings, onImport }) {
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    const exportData = {
      ...settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Noetic Vault-settings-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Settings exported successfully!" },
      }),
    )
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImporting(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          // Validate and clean the imported settings
          const cleanSettings = {
            language: importedSettings.language || "en",
            model: importedSettings.model || "mistral-7b",
            docViewMode: importedSettings.docViewMode || "pdf-viewer",
          }

          setTimeout(() => {
            onImport(cleanSettings)
            setImporting(false)
            window.dispatchEvent(
              new CustomEvent("show-toast", {
                detail: { type: "success", message: "Settings imported successfully!" },
              }),
            )
          }, 1000)
        } catch (error) {
          setImporting(false)
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: { type: "error", message: "Invalid settings file!" },
            }),
          )
        }
      }
      reader.readAsText(file)
    }
  }

  const copySettingsToClipboard = () => {
    const settingsText = JSON.stringify(settings, null, 2)
    navigator.clipboard.writeText(settingsText).then(() => {
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "success", message: "Settings copied to clipboard!" },
        }),
      )
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
          <FileJson className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
        </div>
        <div>
          <h3 className="section-title">Import & Export</h3>
          <p className="section-subtitle">Backup and restore your settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Export Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 p-4 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="font-medium">Export</span>
        </motion.button>

        {/* Import Button */}
        <div className="relative">
          <input type="file" accept=".json" onChange={handleImport} className="hidden" id="settings-import" />
          <motion.label
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            htmlFor="settings-import"
            className="flex items-center justify-center space-x-2 p-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors cursor-pointer w-full"
          >
            {importing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Upload className="w-4 h-4" />
              </motion.div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="font-medium">{importing ? "Importing..." : "Import"}</span>
          </motion.label>
        </div>

        {/* Copy Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copySettingsToClipboard}
          className="flex items-center justify-center space-x-2 p-4 bg-lavender-100 hover:bg-lavender-200 dark:bg-lavender-900/30 dark:hover:bg-lavender-900/50 text-lavender-700 dark:text-lavender-300 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span className="font-medium">Copy</span>
        </motion.button>
      </div>

      {/* Settings Preview */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Settings Preview:</div>
        <div className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border max-h-20 overflow-y-auto">
          {JSON.stringify(settings, null, 2)}
        </div>
      </div>
    </div>
  )
}
