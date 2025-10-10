"use client"

import { Upload, FileText, Zap } from "lucide-react"

export function UploadEmpty({ onUploadClick }) {
  return (
    <div className="text-center py-12">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-full flex items-center justify-center">
          <div className="relative">
            <FileText className="w-16 h-16 text-purple-600 dark:text-purple-400" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
        </div>
        <div className="absolute top-8 right-1/4">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
        </div>
        <div className="absolute bottom-8 left-1/4">
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>

      {/* Content */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Upload your first PDF document to begin chatting with your content using advanced AI technology.
      </p>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Easy Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Drag & drop or click to upload PDFs</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">AI Processing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Advanced AI analyzes your documents</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Smart Chat</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions about your content</p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onUploadClick}
        className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
      >
        <Upload className="w-5 h-5" />
        <span>Upload Your First Document</span>
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Supports PDF files up to 10MB</p>
    </div>
  )
}
