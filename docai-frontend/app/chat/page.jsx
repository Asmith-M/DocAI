"use client"

import { useState } from "react"
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

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [metadataPanelOpen, setMetadataPanelOpen] = useState(false)
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const [agentTrailOpen, setAgentTrailOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [hasMessages, setHasMessages] = useState(false)
  const [chatInput, setChatInput] = useState("")

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
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <main className="container mx-auto px-4 py-4 max-w-7xl h-[calc(100vh-80px)]">
          <div className="flex h-full space-x-4">
            {/* Document Heatmap */}
            <div className="hidden xl:block">
              <DocHeatmap position="left" onPageClick={handlePageClick} className="w-20" />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col space-y-4">
              {/* Chat Header with Controls */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chat with Documents</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions about your uploaded PDFs</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setHistorySidebarOpen(!historySidebarOpen)}
                    className="p-2 text-gray-400 hover:text-lavender-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Document history"
                  >
                    <History className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setMetadataPanelOpen(!metadataPanelOpen)}
                    className="p-2 text-gray-400 hover:text-lavender-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Document metadata"
                  >
                    <Info className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setShowShortcuts(true)}
                    className="p-2 text-gray-400 hover:text-lavender-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Keyboard shortcuts (Ctrl + /)"
                  >
                    <Keyboard className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Prompt Templates */}
              <PromptTemplates onTemplateSelect={handleTemplateSelect} />

              {/* Chat Container */}
              <div className="flex-1 grid lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 flex flex-col">
                  {hasMessages ? (
                    <>
                      <ChatContainer onShowAgentTrail={handleShowAgentTrail} />

                      {/* Follow-up Suggestions */}
                      <div className="mt-4">
                        <FollowUpChips
                          suggestions={[
                            "Tell me more about this topic",
                            "What are the implications?",
                            "Can you provide examples?",
                          ]}
                          onChipClick={handleFollowUpClick}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <ChatEmpty onSampleQuestionClick={handleSampleQuestion} />
                    </div>
                  )}

                  <div className="mt-4">
                    <ChatInput value={chatInput} onChange={setChatInput} onSend={() => setHasMessages(true)} />
                  </div>
                </div>

                <div className="lg:col-span-1">
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
