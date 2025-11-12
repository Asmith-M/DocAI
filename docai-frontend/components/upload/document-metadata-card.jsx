//docai-frontend/components/upload/document-metadata-card.jsx
"use client";

import { motion } from "framer-motion";
import { FileText, Hash, Calendar, Clock } from "lucide-react";

export function DocumentMetadataCard({
  filename,
  pages,
  dateCreated,
  fileSize,
  processingTime,
  className = "",
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/85 backdrop-blur-lg dark:bg-gray-800/85 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="flex items-center space-x-4">
        {/* File Icon */}
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <FileText className="w-6 h-6 text-red-500" />
        </div>

        {/* Metadata Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Filename */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                File
              </span>
            </div>
            <p
              className="text-sm font-medium text-gray-900 dark:text-white truncate"
              title={filename}
            >
              {filename}
            </p>
          </div>

          {/* Pages */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Pages
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {pages?.toLocaleString() || "N/A"}
            </p>
          </div>

          {/* Date Created */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Created
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {dateCreated ? formatDate(dateCreated) : "English"}
            </p>
          </div>

          {/* Processing Time or File Size */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {processingTime ? "Processed" : "Size"}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {processingTime
                ? `${processingTime}s`
                : formatFileSize(fileSize || 0)}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            className="w-3 h-3 bg-green-500 rounded-full mb-1"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ready
          </span>
        </div>
      </div>

      {/* Progress Bar (if processing) */}
      {processingTime && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Document processed successfully</span>
            <span>{processingTime}s</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-green-500 h-1 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
