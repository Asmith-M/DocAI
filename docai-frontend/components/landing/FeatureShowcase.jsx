import React, { useState } from 'react';
import { TrendingUp, Check, Shield, Zap, BrainCircuit, TextSelect, ListOrdered, Sparkles, ShieldCheck } from 'lucide-react';

// Main component for the entire application
const App = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/90 font-sans">
        <FeatureShowcase />
    </div>
  );
};


const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const agents = [
    { name: 'Chunk', icon: TextSelect },
    { name: 'Rank', icon: ListOrdered },
    { name: 'Generate', icon: Sparkles },
    { name: 'Verify', icon: ShieldCheck }
  ];

  const features = [
    {
      id: 0,
      icon: BrainCircuit,
      title: 'Intelligent Collaboration',
      subtitle: 'Powered by a Multi-Agent System',
      description: 'Our system uses a team of specialized AI agents that collaborate to process, understand, and verify information, ensuring the highest accuracy for your queries.',
      highlights: [
        'Semantic chunking for context-rich data',
        'Precision retrieval with a dedicated RankerAgent',
        'Offline answer generation using local LLMs',
        'Factual verification to prevent hallucinations'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-sm">
            {agents.map((agent, i) => {
              const AgentIcon = agent.icon;
              return (<div
                key={agent.name}
                className="aspect-square rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 flex flex-col items-center justify-center p-2 text-center"
                style={{
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                    <AgentIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{agent.name}Agent</span>
              </div>);
            })}
          </div>
        </div>
      )
    },
    {
      id: 1,
      icon: Shield,
      title: 'Secure & Versatile',
      subtitle: 'For Any Industry, Completely Offline',
      description: 'Noetic Vault operates entirely on your local infrastructure. Your sensitive data is never exposed to the cloud, ensuring full privacy and compliance with regulations like GDPR and HIPAA.',
      highlights: [
        'Fully offline operation for maximum data privacy',
        'Domain-agnostic for HR, legal, healthcare & more',
        'Advanced parsing for complex PDF layouts',
        'Aligns with strict security policies and NDAs'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="space-y-3 w-full max-w-sm">
            {['Healthcare Data', 'Legal Documents', 'HR Policies', 'Research Papers'].map((type, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30"
                style={{
                  animation: `slideIn 0.5s ease-out ${i * 0.1}s both`
                }}
              >
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{type}</span>
                <Check className="w-5 h-5 text-green-500 dark:text-green-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: Zap,
      title: 'Powerful & Efficient',
      subtitle: 'AI-Powered Document Intelligence',
      description: 'Leverage Retrieval-Augmented Generation (RAG) and a high-speed local vector database to get instant, context-aware answers. Move beyond simple keyword searches.',
      highlights: [
        'Advanced Retrieval-Augmented Generation (RAG)',
        'High-speed local vector search with ChromaDB',
        'Context-aware semantic understanding',
        'Source verification with citations'
      ],
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-sm h-48">
             <TrendingUp className="absolute top-0 right-0 w-12 h-12 text-purple-500 dark:text-purple-400 animate-pulse" style={{ animationDuration: '2s' }}/>
             <svg width="100%" height="100%" viewBox="0 0 300 150" className="absolute inset-0">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#d8b4fe" />
                    </linearGradient>
                </defs>
                
                {/* Lines */}
                <path d="M 20 130 Q 80 80 150 90" stroke="url(#line-gradient)" fill="none" strokeWidth="2" style={{animation: 'draw 2s ease-out forwards'}}/>
                <path d="M 20 130 Q 100 40 220 70" stroke="url(#line-gradient)" fill="none" strokeWidth="2" style={{animation: 'draw 2.5s ease-out forwards'}}/>
                <path d="M 150 90 T 280 40" stroke="url(#line-gradient)" fill="none" strokeWidth="2" style={{animation: 'draw 3s ease-out forwards'}}/>

                {/* Circles */}
                <circle cx="20" cy="130" r="4" fill="#a855f7" style={{animation: 'pulse 1.5s infinite'}} />
                <circle cx="150" cy="90" r="4" fill="#a855f7" style={{animation: 'pulse 1.5s infinite .2s'}} />
                <circle cx="220" cy="70" r="4" fill="#a855f7" style={{animation: 'pulse 1.5s infinite .4s'}} />
                <circle cx="280" cy="40" r="4" fill="#a855f7" style={{animation: 'pulse 1.5s infinite .6s'}} />
             </svg>
          </div>
        </div>
      )
    }
  ];

  const active = features[activeFeature];
  const Icon = active.icon;

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900/90 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Why Choose Noetic Vault?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            An intelligent, secure, and context-aware document retrieval system designed for the modern enterprise.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column: Feature Buttons */}
          <div className="space-y-4">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;
              const isActive = activeFeature === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`
                    w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 shadow-lg scale-105' 
                      : 'bg-white/60 dark:bg-slate-900/60 border-purple-300/50 dark:border-purple-500/30 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                      }
                    `}>
                      <FeatureIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`
                        text-xl font-bold mb-1 transition-colors
                        ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}
                      `}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Feature Details */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 min-h-[550px] flex flex-col">
            {/* Icon & Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-900/40">
                <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {active.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{active.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {active.description}
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {active.highlights.map((highlight, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    animation: `fadeIn 0.3s ease-out ${i * 0.1}s both`
                  }}
                >
                  <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-sm text-slate-900 dark:text-white">{highlight}</span>
                </div>
              ))}
            </div>

            {/* Visual Content */}
            <div className="flex-1 mt-auto min-h-[200px]">
              {active.visual}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
       .line-drawing-svg path {
             stroke-dasharray: 1000;
             stroke-dashoffset: 1000;
            }     
      `}</style>
    </section>
  );
};

export default App;

