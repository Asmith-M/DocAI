"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"

const sarcasticFacts = [
  "Did you know? AI reads faster than you. Much faster. Like, embarrassingly faster.",
  "Fun fact: Your document has more pages than your attention span.",
  "Processing... because apparently humans need time to think.",
  "AI Tip: We're extracting wisdom. You're extracting coffee.",
  "Breaking: Document contains words. Lots of them. We're counting.",
  "Plot twist: The AI actually reads the terms and conditions.",
  "Spoiler alert: Your document is about to become searchable.",
  "Meanwhile, the AI is judging your font choices.",
  "Pro tip: AI doesn't need coffee breaks. Unlike some people.",
  "Loading... because instant gratification takes time.",
  "The AI is speed-reading. Show off.",
  "Analyzing... and yes, we noticed that typo on page 3.",
  "Fun fact: AI can read PDFs. Humans invented PDFs. Ironic.",
  "Processing faster than you can say 'artificial intelligence'.",
  "Your document is getting the VIP treatment. Red carpet included.",
  "AI Status: Pretending this is hard work.",
  "Breaking news: Document successfully uploaded. World keeps spinning.",
  "The AI is working. You should be too.",
  "Embeddings loading... it's like RAM but fancier.",
  "Plot twist: The AI actually understands your handwriting."
]

export function ProcessingStatus({ isProcessing, currentStep, progress: externalProgress }) {
  const [progress, setProgress] = useState(externalProgress || 0)
  const [currentFact, setCurrentFact] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [activeStep, setActiveStep] = useState(currentStep || 0)

  // Processing steps with exact labels as specified
  const steps = [
    { label: 'Uploading document', threshold: 25 },
    { label: 'Parsing content', threshold: 50 },
    { label: 'Creating embeddings', threshold: 75 },
    { label: 'Finalizing analysis', threshold: 100 }
  ];

  useEffect(() => {
    if (isProcessing) {
      setIsComplete(false)
      setProgress(externalProgress || 0)
      
      // Simulate progress if not provided externally
      if (!externalProgress) {
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval)
              return 95
            }
            const newProgress = prev + Math.random() * 15;
            
            // Update active step based on progress
            if (newProgress >= 75) setActiveStep(3);
            else if (newProgress >= 50) setActiveStep(2);
            else if (newProgress >= 25) setActiveStep(1);
            else setActiveStep(0);
            
            return newProgress;
          })
        }, 800)

        // Rotate facts
        const factInterval = setInterval(() => {
          setCurrentFact(prev => (prev + 1) % sarcasticFacts.length)
        }, 4000)

        return () => {
          clearInterval(progressInterval)
          clearInterval(factInterval)
        }
      }
    } else if (progress > 0) {
      // Complete the progress
      setProgress(100)
      setActiveStep(3)
      setTimeout(() => setIsComplete(true), 500)
    }
  }, [isProcessing, externalProgress])

  // Update active step when external currentStep prop changes
  useEffect(() => {
    if (currentStep !== undefined) {
      setActiveStep(currentStep)
    }
  }, [currentStep])

  if (!isProcessing && progress === 0) {
    // Static state - document analyzed
    return (
      <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">
            Your Document is Analyzed
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-light">
            Ready to start chatting with your content
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 h-full flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Title */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                Processing Your Document
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-light text-lg">
                Creating embeddings and analyzing content...
              </p>
            </div>

            {/* Horizontal Progress Timeline */}
            <div className="relative pt-4 pb-20">
              {/* Progress Bar Background */}
              <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>

              {/* Step Indicators */}
              <div className="absolute top-0 left-0 right-0 w-full">
                {steps.map((step, i) => {
                  const isComplete = progress >= step.threshold;
                  const isActive = i === activeStep && !isComplete;
                  
                  // Calculate position - distribute evenly
                  let stepPosition;
                  if (i === 0) stepPosition = 0;
                  else if (i === steps.length - 1) stepPosition = 100;
                  else stepPosition = (i / (steps.length - 1)) * 100;
                  
                  return (
                    <div 
                      key={i} 
                      className="absolute flex flex-col items-center"
                      style={{ 
                        left: `${stepPosition}%`,
                        transform: 'translateX(-50%)',
                        top: '-4px'
                      }}
                    >
                      {/* Step Circle */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className="relative mb-4"
                      >
                        {isComplete ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                          >
                            <CheckCircle className="w-6 h-6 text-white" />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div
                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-4 border-purple-500 flex items-center justify-center shadow-lg"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(168, 85, 247, 0.7)',
                                '0 0 0 10px rgba(168, 85, 247, 0)',
                                '0 0 0 0 rgba(168, 85, 247, 0)'
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                          </motion.div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-slate-300 dark:border-slate-600" />
                        )}
                      </motion.div>

                      {/* Step Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className="text-center w-28"
                      >
                        <p className={`text-xs font-semibold transition-colors duration-300 leading-tight ${
                          isComplete 
                            ? 'text-purple-600 dark:text-purple-400' 
                            : isActive
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs text-purple-500 dark:text-purple-400 mt-1"
                          >
                            In progress...
                          </motion.p>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="text-center mt-8">
              <motion.div
                key={Math.round(progress)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block"
              >
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            </div>

            {/* Sarcastic Facts */}
            <div className="min-h-[60px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFact}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center max-w-2xl"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic font-light px-4">
                    "{sarcasticFacts[currentFact]}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">
              Processing Complete!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-light">
              Your document is ready for intelligent conversations
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}