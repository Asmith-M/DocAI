"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Upload, Cloud, CloudOff } from "lucide-react"

export function ProfileSync() {
  const [avatar, setAvatar] = useState(null)
  const [cloudSync, setCloudSync] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setTimeout(() => {
          setAvatar(e.target.result)
          setUploading(false)
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: { type: "success", message: "Avatar updated!" },
            }),
          )
        }, 1000)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCloudSync = () => {
    setCloudSync(!cloudSync)
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          type: "info",
          message: `Cloud sync ${!cloudSync ? "enabled" : "disabled"}`,
        },
      }),
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-lavender-100 dark:bg-lavender-900/30 rounded-lg">
          <User className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
        </div>
        <div>
          <h3 className="section-title">Profile & Sync</h3>
          <p className="section-subtitle">Manage your profile and sync settings</p>
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Picture</label>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center overflow-hidden"
            >
              {avatar ? (
                <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </motion.div>
            {uploading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 border-2 border-lavender-300 border-t-lavender-600 rounded-full"
              />
            )}
          </div>

          <div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-4 py-2 bg-lavender-100 hover:bg-lavender-200 dark:bg-lavender-900/30 dark:hover:bg-lavender-900/50 text-lavender-700 dark:text-lavender-300 rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </label>
          </div>
        </div>
      </div>

      {/* Cloud Sync Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-3">
          {cloudSync ? <Cloud className="w-5 h-5 text-blue-500" /> : <CloudOff className="w-5 h-5 text-gray-400" />}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Cloud Sync</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {cloudSync ? "Settings synced across devices" : "Local settings only"}
            </div>
          </div>
        </div>

        <motion.button
          onClick={toggleCloudSync}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            cloudSync ? "bg-lavender-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-lg absolute top-0.5"
            animate={{ x: cloudSync ? 26 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
    </div>
  )
}
