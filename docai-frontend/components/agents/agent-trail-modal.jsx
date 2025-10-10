"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronRight, Search, BarChart3, MessageSquare, CheckCircle } from "lucide-react"

export function AgentTrailModal({ isOpen, onClose, queryText }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set([1]))

  const agentSteps = [
    {
      id: 1,
      name: "ChunkAgent",
      icon: Search,
      status: "completed",
      duration: "0.8s",
      description: "Document chunking and preprocessing",
      details: [
        "Split document into 156 semantic chunks",
        "Applied text preprocessing and normalization",
        "Generated embeddings for each chunk",
        "Indexed chunks for efficient retrieval",
      ],
      output: "156 processed chunks ready for search",
    },
    {
      id: 2,
      name: "RankerAgent",
      icon: BarChart3,
      status: "completed",
      duration: "1.2s",
      description: "Relevance ranking and selection",
      details: [
        "Computed semantic similarity scores",
        "Applied relevance threshold filtering",
        "Selected top 8 most relevant chunks",
        "Ranked by confidence and context relevance",
      ],
      output: "8 high-relevance chunks selected (avg. confidence: 87%)",
    },
    {
      id: 3,
      name: "GeneratorAgent",
      icon: MessageSquare,
      status: "completed",
      duration: "2.1s",
      description: "Response generation and synthesis",
      details: [
        "Analyzed selected chunks for context",
        "Generated coherent response using GPT-4",
        "Applied fact-checking and consistency validation",
        "Formatted response with proper citations",
      ],
      output: "Generated 247-word response with 3 citations",
    },
    {
      id: 4,
      name: "VerifierAgent",
      icon: CheckCircle,
      status: "completed",
      duration: "0.6s",
      description: "Quality assurance and verification",
      details: [
        "Cross-referenced facts against source material",
        "Validated citation accuracy and relevance",
        "Computed confidence score based on evidence",
        "Applied final quality checks",
      ],
      output: "Verification complete - High confidence (92%)",
    },
  ]

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400"
      case "processing":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400"
      case "pending":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How Noetic Vault Got This Answer</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Multi-agent processing pipeline</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close agent trail modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Display */}
        {queryText && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Question:</h3>
            <p className="text-gray-900 dark:text-white italic">"{queryText}"</p>
          </div>
        )}

        {/* Agent Steps */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {agentSteps.map((step, index) => {
              const Icon = step.icon
              const isExpanded = expandedSteps.has(step.id)
              const isLast = index === agentSteps.length - 1

              return (
                <div key={step.id} className="relative">
                  {/* Timeline Line */}
                  {!isLast && <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>}

                  {/* Step Card */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleStep(step.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(step.status)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{step.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {step.duration}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pl-11 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Process Details:
                          </h4>
                          <ul className="space-y-1">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                <span className="w-1.5 h-1.5 bg-lavender-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Output:</h4>
                          <p className="text-sm text-gray-900 dark:text-white">{step.output}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-lavender-50 dark:bg-lavender-900 rounded-lg border border-lavender-200 dark:border-lavender-700">
            <h3 className="font-medium text-lavender-900 dark:text-lavender-100 mb-2">Processing Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-lavender-700 dark:text-lavender-300">Total Time:</span>
                <span className="ml-2 font-medium text-lavender-900 dark:text-lavender-100">4.7s</span>
              </div>
              <div>
                <span className="text-lavender-700 dark:text-lavender-300">Confidence:</span>
                <span className="ml-2 font-medium text-lavender-900 dark:text-lavender-100">92%</span>
              </div>
              <div>
                <span className="text-lavender-700 dark:text-lavender-300">Chunks Processed:</span>
                <span className="ml-2 font-medium text-lavender-900 dark:text-lavender-100">156</span>
              </div>
              <div>
                <span className="text-lavender-700 dark:text-lavender-300">Sources Used:</span>
                <span className="ml-2 font-medium text-lavender-900 dark:text-lavender-100">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
