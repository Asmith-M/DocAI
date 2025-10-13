"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SourcePanel({
  sources: propSources = [],
  matchedPhrases = [],
}) {
  const [expandedSource, setExpandedSource] = useState(null);
  const [sources, setSources] = useState(propSources);
  const sourcesEndRef = useRef(null);

  const toggleSource = (sourceId) => {
    setExpandedSource(expandedSource === sourceId ? null : sourceId);
  };

  // Listen for update-sources events from ChatContainer
  useEffect(() => {
    const handler = (e) => {
      const newSources = e?.detail?.sources;
      if (newSources) {
        setSources(newSources);
      }
    };
    window.addEventListener("update-sources", handler);
    return () => window.removeEventListener("update-sources", handler);
  }, []);

  // Update sources when prop changes
  useEffect(() => {
    if (propSources && propSources.length > 0) {
      setSources(propSources);
    }
  }, [propSources]);

  // Auto-scroll to bottom when new sources are added
  useEffect(() => {
    sourcesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sources]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 h-full overflow-hidden flex flex-col min-h-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className="section-title">Sources</h3>
        <p className="section-subtitle">
          Referenced content from your documents
        </p>
      </div>

      <div
        className="overflow-y-auto flex-1 p-4 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        {sources.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No sources available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source, index) => {
              // Handle new aggregated sources format from /chat endpoint
              if (source.fileName && source.pages) {
                return (
                  <motion.div
                    key={`aggregated-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50 p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          {source.fileName}
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {source.pages}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Handle internal_knowledge type sources
              if (source.type === "internal_knowledge") {
                return (
                  <motion.div
                    key={`internal-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50 p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Internal Knowledge Base
                        </h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                          {source.documentName}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {source.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Handle regular sources
              return (
                <motion.div
                  key={source.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <button
                    onClick={() => toggleSource(source.id || index)}
                    className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {source.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Page {source.page} • {source.relevance}% relevance
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {source.snippet}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {expandedSource === (source.id || index) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedSource === (source.id || index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 dark:border-gray-600"
                      >
                        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-b-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            {source.snippet}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Relevance: {source.relevance}%
                            </div>
                            <button className="flex items-center space-x-1 text-xs text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300">
                              <span>View in document</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            <div ref={sourcesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
