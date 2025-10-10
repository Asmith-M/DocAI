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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="section-title text-sm">Quick Actions</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Add custom template"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <div key={template.id} className="group relative">
              {/* ## Button Style Updated ## */}
              <button
                onClick={() => onTemplateSelect?.(template.prompt)}
                className="inline-flex items-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-display">Add Custom Template</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Legal Review"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Prompt Template
                </label>
                <textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                  placeholder="Enter your prompt template..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Cancel
              </button>
              {/* ## Button Style Updated ## */}
              <button
                onClick={handleAddTemplate}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
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