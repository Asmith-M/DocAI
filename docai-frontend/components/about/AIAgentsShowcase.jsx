"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, Sparkles, CheckCircle, Check, Layers, BarChart3, Zap } from 'lucide-react';

// A simple wrapper for scroll animations, assuming it exists elsewhere.
const ScrollAnimationWrapper = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        viewport={{ once: true }}
    >
        {children}
    </motion.div>
);


export function AIAgentsShowcase() {
  const [activeAgent, setActiveAgent] = useState(0);

  const agents = [
    {
      id: 0,
      icon: Layers,
      name: 'Chunk Agent',
      role: 'Document Processor',
      description: 'Intelligently breaks down documents into semantic chunks while preserving context and structure. Handles text, tables, and complex layouts with precision.',
      capabilities: [
        'Smart document segmentation',
        'Table extraction and processing',
        'Context-aware chunking',
        'Metadata preservation'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Document splitting animation */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ width: '100%', opacity: 0 }}
                  animate={{ 
                    width: ['100%', '90%', '85%', '80%'][i - 1],
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="h-16 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center relative overflow-hidden"
                >
                  <motion.div
                    animate={{ 
                      x: ['-100%', '100%']
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                  <FileText className="w-6 h-6 text-white relative z-10" />
                </motion.div>
              ))}
            </div>
            <motion.div
              animate={{ 
                rotate: [0, -15, 15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -right-8 top-1/2 -translate-y-1/2"
            >
              <Layers className="w-16 h-16 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      icon: BarChart3,
      name: 'Ranker Agent',
      role: 'Relevance Scorer',
      description: 'Uses hybrid ranking with semantic embeddings and lexical matching to find the most relevant document chunks. Applies MMR for diversity to ensure comprehensive answers.',
      capabilities: [
        'Hybrid semantic + lexical search',
        'TF-IDF similarity scoring',
        'MMR diversity optimization',
        'Context relevance ranking'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-full max-w-md space-y-4">
            {[
              { label: 'Chunk 1', score: 95 },
              { label: 'Chunk 2', score: 87 },
              { label: 'Chunk 3', score: 78 },
              { label: 'Chunk 4', score: 65 }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{item.score}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            ))}
            <motion.div
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -right-4 -top-4"
            >
              <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: Sparkles,
      name: 'Generator Agent',
      role: 'Answer Synthesizer',
      description: 'Generates natural, contextual answers using advanced language models. Supports streaming responses and automatic fallback to ensure reliability.',
      capabilities: [
        'Context-aware generation',
        'Streaming response support',
        'Automatic model fallback',
        'Prompt optimization'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-purple-300/50 dark:border-purple-500/30">
              <div className="space-y-3">
                {['The document discusses...', 'Key findings include...', 'Based on the context...'].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: i * 0.8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 1
                    }}
                    className="flex items-start gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{text}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                animate={{ 
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mt-4 h-1 w-16 bg-purple-600 rounded-full"
              />
            </div>
            <motion.div
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-6 -right-6"
            >
              <Zap className="w-14 h-14 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      icon: CheckCircle,
      name: 'Verifier Agent',
      role: 'Quality Assurance',
      description: 'Validates generated answers against source context to ensure accuracy. Detects hallucinations and provides confidence scores for each response.',
      capabilities: [
        'Fact verification against context',
        'Hallucination detection',
        'Confidence score calculation',
        'Answer relevance checking'
      ],
      visual: (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Context Coverage', value: '94%', icon: FileText },
                        { label: 'Fact Accuracy', value: '98%', icon: Check },
                        { label: 'Relevance Score', value: '91%', icon: TrendingUp },
                        { label: 'Confidence', value: 'High', icon: CheckCircle }
                    ].map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                duration: 0.5, 
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 2
                            }}
                            className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-purple-300/50 dark:border-purple-500/30 text-center"
                        >
                            <metric.icon className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{metric.label}</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{metric.value}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      )
    }
  ];

  const active = agents[activeAgent];
  const Icon = active.icon;

  return (
    <section className="py-32 px-4 relative mb-24 bg-white/85 backdrop-blur-lg dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimationWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Meet the AI Agents
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our multi-agent RAG system uses specialized AI agents that work together to deliver accurate, 
              contextual answers from your documents
            </p>
          </div>
        </ScrollAnimationWrapper>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Agent Cards */}
          <div className="space-y-4">
            {agents.map((agent) => {
              const AgentIcon = agent.icon;
              const isActive = activeAgent === agent.id;
              
              return (
                <ScrollAnimationWrapper key={agent.id} delay={agent.id * 0.1}>
                  <motion.button
                    onClick={() => setActiveAgent(agent.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full text-left p-6 rounded-3xl border-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-2xl shadow-purple-500/20 scale-105' 
                        : 'backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-purple-300/50 dark:border-purple-500/30 hover:border-purple-400 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div 
                        animate={isActive ? { rotate: [0, 360] } : {}}
                        transition={{ duration: 0.6 }}
                        className={`
                          p-3 rounded-2xl transition-all duration-300
                          ${isActive 
                            ? 'bg-purple-600 text-white shadow-lg' 
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }
                        `}
                      >
                        <AgentIcon className="w-7 h-7" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`
                          text-xl font-black mb-1 tracking-tight transition-colors
                          ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}
                        `}>
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-light">
                          {agent.role}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-purple-600 rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                </ScrollAnimationWrapper>
              );
            })}
          </div>

          {/* Right Column: Agent Details */}
          <ScrollAnimationWrapper>
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 min-h-[600px] flex flex-col sticky top-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAgent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                      <Icon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {active.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-light">{active.role}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-light">
                    {active.description}
                  </p>

                  {/* Capabilities */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Key Capabilities
                    </h4>
                    {active.capabilities.map((capability, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span className="text-sm text-slate-900 dark:text-white font-light">{capability}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Visual Demonstration */}
                  <div className="flex-1 mt-auto min-h-[250px] flex items-center justify-center">
                    {active.visual}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
}

