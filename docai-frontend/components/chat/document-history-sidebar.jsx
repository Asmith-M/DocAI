"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
  Loader2,
} from "lucide-react";
import { DocumentHistoryItem } from "./document-history-item";
import { ClearHistoryModal } from "./clear-history-modal";
import { listFiles, getTables, getChunks } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export function DocumentHistorySidebar({ isOpen, onToggle }) {
  const [showClearModal, setShowClearModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles();
      const files = data.files || data.documents || data.data || [];

      if (!Array.isArray(files)) {
        throw new Error("Invalid response format from API");
      }

      const formattedDocuments = files.map((file, index) => ({
        id: file.document_id || file.documentId || file.id || index + 1,
        name: file.filename || file.name,
        uploadDate: file.upload_date
          ? new Date(file.upload_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: file.status === "processed" ? "completed" : file.status,
        pages: file.page_count || file.pages || 0,
        lastAccessed: "Recently",
        documentId: file.document_id || file.documentId || file.id,
        language: file.language || "Unknown",
      }));
      setDocuments(formattedDocuments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleDocumentSelect = async (document) => {
    console.log("Selected document:", document);

    try {
      // Fetch tables and chunks for the selected document
      const [tablesData, chunksData] = await Promise.all([
        getTables(document.documentId),
        getChunks(document.documentId),
      ]);

      // Dispatch custom event with document data
      window.dispatchEvent(
        new CustomEvent("document-selected", {
          detail: {
            document,
            tables: tablesData.tables || [],
            chunks: chunksData.chunks || [],
          },
        })
      );

      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            type: "success",
            message: `Loaded ${document.name} into chat`,
          },
        })
      );

      // Navigate to chat page with selected document id as query param
      navigate(`/chat?documentId=${document.documentId || document.id}`);
      onToggle();
    } catch (error) {
      console.error("Failed to load document data:", error);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            type: "error",
            message: `Failed to load ${document.name}: ${error.message}`,
          },
        })
      );
    }
  };

  const handleClearHistory = () => {
    setShowClearModal(false);
    // Here you would clear the document history
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: "Document history cleared" },
      })
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 shadow-lg"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document History
                  </h3>
                  <button
                    onClick={onToggle}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recently accessed documents
                </p>
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Loader2 className="w-8 h-8 text-lavender-500 animate-spin mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading documents...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <FileText className="w-12 h-12 text-red-300 dark:text-red-600 mb-3" />
                    <p className="text-red-500 dark:text-red-400 mb-2">
                      Failed to load documents
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {error}
                    </p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No documents in history
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {documents.map((document, index) => (
                      <DocumentHistoryItem
                        key={document.id}
                        document={document}
                        index={index}
                        onSelect={handleDocumentSelect}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {documents.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed left-4 top-20 z-50 p-3 bg-lavender-500 hover:bg-lavender-600 text-white rounded-full shadow-lg transition-colors ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      <ClearHistoryModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearHistory}
      />
    </>
  );
}
