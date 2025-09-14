"use client"

import { useState, useRef } from "react"
import { FileUploader } from "@/components/upload/file-uploader"
import { FileStatusList } from "@/components/upload/file-status-list"
import { UploadInstructions } from "@/components/upload/upload-instructions"
import { UploadEmpty } from "@/components/empty-states/upload-empty"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import { ConfettiEffect } from "@/components/shared/confetti-effect"
import { PageTransition } from "@/components/shared/page-transition"

export default function UploadPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiTriggered, setConfettiTriggered] = useState(false)
  const [hasFiles, setHasFiles] = useState(false)
  const fileUploaderRef = useRef(null)

  const handleUploadSuccess = () => {
    if (!confettiTriggered) {
      setShowConfetti(true)
      setConfettiTriggered(true)
    }
    setHasFiles(true)
  }

  const handleUploadClick = () => {
    // Trigger file upload dialog via ref
    if (fileUploaderRef.current) {
      fileUploaderRef.current.clickInput()
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {!hasFiles ? (
            <>
              <ScrollAnimationWrapper>
                <UploadEmpty onUploadClick={handleUploadClick} />
              </ScrollAnimationWrapper>
              {/* Hidden FileUploader to provide input element */}
              <div className="hidden">
                <FileUploader ref={fileUploaderRef} onUploadSuccess={handleUploadSuccess} />
              </div>
            </>
          ) : (
            <>
              <ScrollAnimationWrapper>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Upload Your Documents</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Upload PDF files to start chatting with your documents
                  </p>
                </div>
              </ScrollAnimationWrapper>

              <div className="grid lg:grid-cols-2 gap-8">
                <ScrollAnimationWrapper>
                  <FileUploader ref={fileUploaderRef} onUploadSuccess={handleUploadSuccess} />
                </ScrollAnimationWrapper>

                <div className="space-y-6">
                  <ScrollAnimationWrapper>
                    <UploadInstructions />
                  </ScrollAnimationWrapper>

              <ScrollAnimationWrapper>
                <FileStatusList onRefresh={hasFiles} />
              </ScrollAnimationWrapper>
                </div>
              </div>
            </>
          )}
        </main>

        <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      </div>
    </PageTransition>
  )
}
