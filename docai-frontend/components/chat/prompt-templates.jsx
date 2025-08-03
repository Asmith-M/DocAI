"use client"

import { useState } from "react"
import { Plus, Trash2, Zap } from "lucide-react"

export function PromptTemplates({ onTemplateSelect }) {
  const [templates, setTemplates] = useState([
    { id: 1, name: "Summarize", prompt: "Please provide a comprehensive summary of this document" },
    { id: 2, name: "Extract Key Points", prompt: "What are the main key points and takeaways from this document?" },
    {
      id: 3,
      name: "Find Obligations",
      prompt: "Extract all obligations, requirements, and commitments mentioned in this document",
    },
    { id: 4, name: "Risk Analysis", prompt: "Identify potential risks, concerns, or red flags in this document" },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [newTemplate, setNewTemplate] = useState({ name: "", prompt: "" })

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.prompt) {
      setTemplates([
        ...templates,
        {
          id: Date.now(),
          name: newTemplate.name,
          prompt: newTemplate.prompt,
        },
      ])
      setNewTemplate({ name: "", prompt: "" })
      setShowAddModal(false)

      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "success", message: "Template added successfully!" },
        }),
      )
    }
  }

  const handleDeleteTemplate = (id) => {
    setTemplates(templates.filter((t) => t.id !== id))
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: "Template deleted" },
      }),
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-lavender-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-1 text-gray-400 hover:text-lavender-500 transition-colors"
            title="Add custom template"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <div key={template.id} className="group relative">
              <button
                onClick={() => onTemplateSelect?.(template.prompt)}
                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-lavender-500 to-purple-500 text-white rounded-lg text-sm hover:from-lavender-600 hover:to-purple-600 transition-all transform hover:scale-105"
              >
                {template.name}
              </button>

              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Custom Template</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Legal Review"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt Template
                </label>
                <textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                  placeholder="Enter your prompt template..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTemplate}
                className="px-4 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-colors"
              >
                Add Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
