"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Check, X } from "lucide-react"

export function DocAIBadge({ version = "V1.0", editable = false, onVersionChange, position = "bottom-right" }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(version)
  const [isHovered, setIsHovered] = useState(false)

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }

  const handleSave = () => {
    if (editValue.trim()) {
      onVersionChange?.(editValue.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(version)
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isHovered || isEditing ? 1 : 0.6,
        scale: isHovered || isEditing ? 1.05 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-lavender-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-lavender-400/50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">DocAI</span>

          {editable && isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="bg-white/20 text-white placeholder-white/70 text-sm px-2 py-1 rounded w-16 focus:outline-none focus:ring-1 focus:ring-white/50"
                autoFocus
              />
              <button onClick={handleSave} className="p-1 hover:bg-white/20 rounded transition-colors" title="Save">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={handleCancel} className="p-1 hover:bg-white/20 rounded transition-colors" title="Cancel">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold">{version}</span>
              {editable && isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Edit version"
                >
                  <Edit3 className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
