"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, X } from "lucide-react"

export function FeedbackWidget({ messageId }) {
  const [feedback, setFeedback] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")

  const handleFeedback = (type) => {
    setFeedback(type)

    if (type === "positive") {
      // Show success toast
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "success", message: "Thanks for your feedback!" },
        }),
      )
    } else {
      setShowFeedbackModal(true)
    }
  }

  const submitNegativeFeedback = () => {
    // In a real app, this would send to backend
    console.log("Negative feedback:", { messageId, feedback: feedbackText })

    setShowFeedbackModal(false)
    setFeedbackText("")

    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: "Feedback submitted. We'll improve!" },
      }),
    )
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Was this helpful?</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFeedback("positive")}
            className={`p-2 rounded-lg transition-colors ${
              feedback === "positive"
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900"
            }`}
            title="This was helpful"
            aria-label="Mark as helpful"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFeedback("negative")}
            className={`p-2 rounded-lg transition-colors ${
              feedback === "negative"
                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
            }`}
            title="This needs improvement"
            aria-label="Mark as not helpful"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Help us improve</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">What went wrong with this response?</p>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={4}
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitNegativeFeedback}
                className="px-4 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
