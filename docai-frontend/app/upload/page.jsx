"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { FileUploader } from "@/components/upload/file-uploader"
import { FileStatusList } from "@/components/upload/file-status-list"
import { UploadEmpty } from "@/components/empty-states/upload-empty"
import { ProcessingStatus } from "@/components/upload/processing-status"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import { ConfettiEffect } from "@/components/shared/confetti-effect"
import { PageTransition } from "@/components/shared/page-transition"
import PlexusBackground from "@/components/ui/PlexusBackground"

export default function UploadPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiTriggered, setConfettiTriggered] = useState(false)
  const [hasFiles, setHasFiles] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showProcessingOnEmpty, setShowProcessingOnEmpty] = useState(false)
  const fileUploaderRef = useRef(null)

  const handleUploadSuccess = () => {
    if (!confettiTriggered) {
      setShowConfetti(true)
      setConfettiTriggered(true)
    }
    setHasFiles(true)
    setShowProcessingOnEmpty(false)
  }

  const handleUploadClick = () => {
    // Trigger file upload dialog via ref
    if (fileUploaderRef.current) {
      fileUploaderRef.current.clickInput()
    }
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setShowProcessingOnEmpty(true)
  }

  const handleProcessingComplete = () => {
    setIsProcessing(false)
  }

  return (
    <PageTransition>
      <PlexusBackground />
      <div className="min-h-screen bg-gradient-lavender-soft">

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {!hasFiles && !showProcessingOnEmpty ? (
            <>
              <ScrollAnimationWrapper>
                <UploadEmpty onUploadClick={handleUploadClick} />
              </ScrollAnimationWrapper>
              {/* Hidden FileUploader to provide input element */}
              <div className="hidden">
                <FileUploader 
                  ref={fileUploaderRef} 
                  onUploadSuccess={handleUploadSuccess}
                  onProcessingStart={handleProcessingStart}
                  onProcessingComplete={handleProcessingComplete}
                />
              </div>
            </>
          ) : showProcessingOnEmpty ? (
            <>
              <ScrollAnimationWrapper>
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 font-display">Processing Your Document</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Please wait while we analyze your document
                  </p>
                </div>
              </ScrollAnimationWrapper>

              <div className="max-w-3xl mx-auto">
                <ScrollAnimationWrapper>
                  <ProcessingStatus isProcessing={isProcessing} />
                </ScrollAnimationWrapper>
              </div>

              {/* Hidden FileUploader to continue processing */}
              <div className="hidden">
                <FileUploader 
                  ref={fileUploaderRef} 
                  onUploadSuccess={handleUploadSuccess}
                  onProcessingStart={handleProcessingStart}
                  onProcessingComplete={handleProcessingComplete}
                />
              </div>
            </>
          ) : (
            <>
              <ScrollAnimationWrapper>
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 font-display">Upload Your Documents</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Upload PDF files to start chatting with your documents
                  </p>
                </div>
              </ScrollAnimationWrapper>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Processing Status */}
                <ScrollAnimationWrapper>
                  <ProcessingStatus isProcessing={isProcessing} />
                </ScrollAnimationWrapper>

                {/* Right: Upload Interface */}
                <div className="space-y-8">
                  <ScrollAnimationWrapper>
                    <FileUploader 
                      ref={fileUploaderRef} 
                      onUploadSuccess={handleUploadSuccess}
                      onProcessingStart={handleProcessingStart}
                      onProcessingComplete={handleProcessingComplete}
                    />
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
