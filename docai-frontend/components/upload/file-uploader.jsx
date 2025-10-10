//docai-frontend/components/upload/file-uploader.jsx
"use client"

import { useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DocumentMetadataCard } from "./document-metadata-card"
import { uploadFiles as apiUploadFiles } from "../../lib/api"

export const FileUploader = forwardRef(({ onUploadSuccess, onProcessingStart, onProcessingComplete }, ref) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useImperativeHandle(ref, () => ({
    clickInput: () => {
      const input = document.querySelector('input[type="file"]')
      input?.click()
    }
  }))

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending",
      progress: 0,
      extractionMethod: null,
      pageCount: 0,
      documentId: null,
      message: "",
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Start real upload process
    uploadFiles(newFiles)
  }, [])

  const uploadFiles = async (filesToUpload) => {
    setUploading(true)
    onProcessingStart?.()

    const fileObjects = filesToUpload.map((fileObj) => fileObj.file)

    try {
      // Update status to uploading before API call
      setFiles((prevFiles) =>
        prevFiles.map((fileObj) => {
          const isUploading = filesToUpload.some((f) => f.id === fileObj.id)
          if (isUploading) {
            return {
              ...fileObj,
              status: "uploading",
              progress: 0,
              message: "",
            }
          }
          return fileObj
        }),
      )

      const onUploadProgress = (progress) => {
        setFiles((prevFiles) =>
          prevFiles.map((fileObj) => {
            const isUploading = filesToUpload.some((f) => f.id === fileObj.id)
            if (isUploading) {
              return {
                ...fileObj,
                progress: Math.min(progress, 90), // Cap at 90% until processing completes
              }
            }
            return fileObj
          }),
        )
      }

      const data = await apiUploadFiles(fileObjects, onUploadProgress)
      console.log("Upload response:", data) // Debug log
      const uploadedFiles = data.files

      console.log("Uploaded files:", uploadedFiles) // Debug log

      setFiles((prevFiles) =>
        prevFiles.map((fileObj) => {
          const uploadedFile = uploadedFiles.find((uf) => uf.filename === fileObj.file.name)
          console.log("Matching file:", fileObj.file.name, "with uploaded:", uploadedFile) // Debug log
          if (uploadedFile) {
            return {
              ...fileObj,
              status: uploadedFile.status === "processed" ? "completed" : uploadedFile.status,
              progress: uploadedFile.status === "processed" ? 100 : fileObj.progress,
              extractionMethod: uploadedFile.extraction_method,
              pageCount: uploadedFile.page_count,
              documentId: uploadedFile.document_id,
              message: uploadedFile.message || "",
            }
          }
          return fileObj
        }),
      )

      // Show success toast for all successfully processed files
      if (uploadedFiles.some((f) => f.status === "processed")) {
        onUploadSuccess?.()
        onProcessingComplete?.()
        // Show success toast
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { type: "success", message: "File uploaded and processed successfully!" },
          }),
        )
      } else if (uploadedFiles.length > 0) {
        onProcessingComplete?.()
        // Show info toast for uploaded files that may need further processing
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { type: "info", message: "File uploaded. Processing may take a moment." },
          }),
        )
      }
    } catch (error) {
      onProcessingComplete?.()
      // Update all files to error status with message
      setFiles((prevFiles) =>
        prevFiles.map((fileObj) => ({
          ...fileObj,
          status: "error",
          message: error.message,
        })),
      )
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="space-y-6">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-purple-300 hover:border-purple-400 dark:border-purple-600 dark:hover:border-purple-500"
        }`}
      >
        <input {...getInputProps()} />

        <motion.div animate={{ y: isDragActive ? -10 : 0 }} transition={{ duration: 0.2 }}>
          <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? "text-purple-500" : "text-purple-400 dark:text-purple-500"}`} />
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isDragActive ? "Drop your files here" : "Upload PDF Documents"}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4">Drag and drop your PDF files here, or click to browse</p>

        <div className="text-sm text-gray-500 dark:text-gray-400">Maximum file size: 10MB • PDF files only</div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {files.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              className="flex items-center p-4 bg-white/85 backdrop-blur-lg dark:bg-gray-800/85 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <FileText className="w-8 h-8 text-red-500 mr-3" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileObj.file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {fileObj.status === "uploading" && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${fileObj.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {fileObj.status === "error" && (
                    <p className="text-xs text-red-500 mt-2">{fileObj.message}</p>
                  )}

                  {fileObj.status === "completed" && fileObj.extractionMethod && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Extraction Method: {fileObj.extractionMethod}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {fileObj.status === "completed" && <div className="w-2 h-2 bg-green-500 rounded-full" />}

                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Metadata Cards */}
      {files
        .filter((f) => f.status === "completed")
        .map((fileObj) => (
          <DocumentMetadataCard
            key={`metadata-${fileObj.id}`}
            filename={fileObj.file.name}
            pages={fileObj.pageCount}
            dateCreated={new Date()}
            fileSize={fileObj.file.size}
            processingTime={3.2}
            className="mt-4"
          />
        ))}
    </div>
  )
})
