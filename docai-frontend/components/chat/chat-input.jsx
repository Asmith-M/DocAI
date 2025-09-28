"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic, Square, Globe, ChevronDown } from "lucide-react"

export function ChatInput({ value, onChange, onSend, documentId }) {
  const [inputValue, setInputValue] = useState(value || "")
  const [isRecording, setIsRecording] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [selectedLang, setSelectedLang] = useState("Auto")
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Check for easter egg
    if (inputValue.trim() === ":about") {
      window.dispatchEvent(new CustomEvent("trigger-easter-egg"))
      setInputValue("")
      onChange?.("")
      return
    }

    if (inputValue.trim()) {
      onSend?.(inputValue.trim())
      // Dispatch a global event so chat container can pick it up without lifting state
      try {
        const lang = autoDetect ? undefined : selectedLang.split(' ')[1]?.replace(/[()]/g, '') || selectedLang
        const auto_detect = autoDetect
        window.dispatchEvent(new CustomEvent('chat-send', { detail: { text: inputValue.trim(), documentId, lang, auto_detect } }))
      } catch (e) {
        // noop if CustomEvent not supported in environment
      }
      setInputValue("")
      onChange?.("")
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop voice recording
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          type: "info",
          message: isRecording ? "Recording stopped" : "Recording started (demo)",
        },
      }),
    )
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-end space-x-3 p-4">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-lavender-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents... (Try typing ':about' for a surprise!)"
              className="w-full resize-none border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ maxHeight: "120px" }}
            />
          </div>

          {/* Language Controls */}
          <div className="flex items-center space-x-2">
            {/* Auto-detect Toggle */}
            <button
              type="button"
              onClick={() => setAutoDetect(!autoDetect)}
              className={`p-2 rounded-lg transition-colors ${
                autoDetect
                  ? "text-lavender-500 bg-lavender-50 dark:bg-lavender-900"
                  : "text-gray-400 hover:text-lavender-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={autoDetect ? "Auto-detect language enabled" : "Auto-detect language disabled"}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={autoDetect}
              >
                <span className={autoDetect ? "text-gray-400" : "text-gray-900 dark:text-white"}>
                  {selectedLang}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLangDropdown && !autoDetect && (
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {["Auto", "English (en)", "Hindi (hi)", "Marathi (mr)"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLang(lang)
                        setShowLangDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? "text-red-500 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800"
                : "text-gray-400 hover:text-lavender-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute -top-12 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Recording...</span>
        </div>
      )}
    </form>
  )
}
