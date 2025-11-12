"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Keyboard, Info, History } from "lucide-react"
import { ChatContainer } from "@/components/chat/chat-container"
import { ChatInput } from "@/components/chat/chat-input"
import { SourcePanel } from "@/components/chat/source-panel"
import { DocumentHistorySidebar } from "@/components/chat/document-history-sidebar"
import { KeyboardShortcutsModal } from "@/components/chat/keyboard-shortcuts-modal"
import { DocInfoPanel } from "@/components/metadata/doc-info-panel"
import { HistorySidebar } from "@/components/metadata/history-sidebar"
import { AgentTrailModal } from "@/components/agents/agent-trail-modal"
import { DocHeatmap } from "@/components/widgets/doc-heatmap"
import { PromptTemplates } from "@/components/chat/prompt-templates"
import { FollowUpChips } from "@/components/chat/follow-up-chips"
import { ChatEmpty } from "@/components/empty-states/chat-empty"
import { PageTransition } from "@/components/shared/page-transition"
import PlexusBackground from "@/components/ui/PlexusBackground"
import { listFiles, getTables, getChunks } from "@/lib/api"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [metadataPanelOpen, setMetadataPanelOpen] = useState(false)
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [agentTrailOpen, setAgentTrailOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [hasMessages, setHasMessages] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchParams] = useSearchParams()

  // Handle document selection from URL parameter
  useEffect(() => {
    const documentId = searchParams.get('documentId')
    if (documentId) {
      loadDocumentById(documentId)
    }
  }, [searchParams])

  const loadDocumentById = async (documentId) => {
    try {
      // Fetch document details from the list
      const response = await listFiles()
      const files = response.files || response.documents || response.data || []

      if (!Array.isArray(files)) {
        throw new Error("Invalid response format from API")
      }

      const document = files.find(file => file.document_id === documentId || file.documentId === documentId || file.id === documentId)

      if (document) {
        // Fetch tables and chunks for the selected document
        const [tablesData, chunksData] = await Promise.all([
          getTables(documentId),
          getChunks(documentId),
        ])

        // Dispatch custom event with document data
        window.dispatchEvent(
          new CustomEvent("document-selected", {
            detail: {
              document: {
                id: document.document_id || document.documentId || document.id,
                name: document.filename || document.name,
                documentId: document.document_id || document.documentId || document.id,
                status: document.status === "processed" ? "completed" : document.status,
              },
              tables: tablesData.tables || tablesData.data || [],
              chunks: chunksData.chunks || chunksData.data || [],
            },
          }),
        )

        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { type: "success", message: `Loaded ${document.filename || document.name} into chat` },
          }),
        )
      } else {
        throw new Error(`Document with ID ${documentId} not found`)
      }
    } catch (error) {
      console.error("Failed to load document:", error)
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { type: "error", message: `Failed to load document: ${error.message}` },
        }),
      )
    }
  }

  const handleSampleQuestion = (question) => {
    setChatInput(question)
    setHasMessages(true)
  }

  const handleTemplateSelect = (prompt) => {
    setChatInput(prompt)
  }

  const handleFollowUpClick = (suggestion) => {
    setChatInput(suggestion)
  }

  const handleShowAgentTrail = (query) => {
    setCurrentQuery(query)
    setAgentTrailOpen(true)
  }

  const handlePageClick = (pageNumber) => {
    console.log(`Jump to page ${pageNumber}`)
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "info", message: `Jumping to page ${pageNumber}` },
      }),
    )
  }

  const handleDocumentSelect = (document) => {
    console.log("Selected document:", document)
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { type: "success", message: `Loaded ${document.filename}` },
      }),
    )
  }

  return (
    <PageTransition>
      <PlexusBackground />
      <div className="min-h-screen bg-gradient-lavender-soft">

        <main className="container mx-auto px-4 py-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col">
          <div className="flex flex-1 gap-6 min-h-0">
            {/* Document Heatmap */}
            <div className="hidden xl:block">
              <DocHeatmap position="left" onPageClick={handlePageClick} className="w-24" />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* Chat Container - Split Layout */}
              <div className="flex-1 grid lg:grid-cols-5 gap-6 min-h-0">
                <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden">
                  {/* Chat messages area - takes remaining space */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {hasMessages ? (
                      <ChatContainer
                        onShowAgentTrail={handleShowAgentTrail}
                        isTyping={isTyping}
                        onTypingChange={setIsTyping}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700">
                        <ChatEmpty onSampleQuestionClick={handleSampleQuestion} />
                      </div>
                    )}
                  </div>

                  {/* Quick Actions - always visible at bottom */}
                  <div className="flex-shrink-0">
                    <PromptTemplates onTemplateSelect={handleTemplateSelect} />
                  </div>

                  {/* Chat Input - always visible at bottom */}
                  <div className="flex-shrink-0">
                    <ChatInput
                      value={chatInput}
                      onChange={setChatInput}
                      onSend={() => setHasMessages(true)}
                      documentId={searchParams.get('documentId')}
                      isTyping={isTyping}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 min-h-0 overflow-hidden">
                  <SourcePanel />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebars and Modals */}
        <DocumentHistorySidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <HistorySidebar
          isOpen={historySidebarOpen}
          onToggle={() => setHistorySidebarOpen(!historySidebarOpen)}
          onDocumentSelect={handleDocumentSelect}
        />

        <DocInfoPanel isOpen={metadataPanelOpen} onClose={() => setMetadataPanelOpen(false)} />

        <AgentTrailModal isOpen={agentTrailOpen} onClose={() => setAgentTrailOpen(false)} queryText={currentQuery} />

        <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </PageTransition>
  )
}
