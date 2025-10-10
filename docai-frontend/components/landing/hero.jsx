import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, FileText, MessageSquare, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BentoGrid } from '../bento/BentoGrid';

// Subtle origami-inspired background
const OrigamiBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft geometric shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-bento-xl transform rotate-12 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-bento-xl transform -rotate-12 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-muted/20 rounded-full blur-3xl" />
      
      {/* Origami fold lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="origami-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0,0 L50,50 L100,0" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
            <path d="M0,100 L50,50 L100,100" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#origami-pattern)" />
      </svg>
    </div>
  );
};

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Smart Document Analysis',
      description: 'AI-powered extraction and understanding of your PDFs',
      color: 'lavender-500'
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Chat naturally with your documents like talking to an expert',
      color: 'lavender-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your documents stay secure with offline-first architecture',
      color: 'lavender-700'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <OrigamiBackground />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full py-20">
        <div className="text-center mb-16">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bento-card"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Powered by Multi-Agent AI
            </span>
            <Zap className="w-4 h-4 text-primary" />
          </div>

          {/* Headline */}
          <h1 className="relative mb-6">
            <div
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 font-display"
              style={{
                transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
              }}
            >
              <span className="text-slate-900 dark:text-white">
                Chat with Your
              </span>
            </div>
            <div
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight font-display"
              style={{
                transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px)`,
              }}
            >
              <span className="text-purple-600 dark:text-purple-400">
                Documents
              </span>
            </div>
          </h1>

          {/* Description */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          >
            Upload your PDFs and have intelligent conversations with your documents. 
            Get instant answers, summaries, and insights powered by advanced AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/upload">
              <button className="group px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-bento font-semibold text-lg shadow-bento-lg hover:shadow-bento-hover transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>

            <Link to="/about">
              <button className="group px-8 py-4 bento-card hover:shadow-bento-hover text-foreground rounded-bento font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Learn More
                  <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Cards - Bento Grid */}
        <BentoGrid columns={3} gap={6} className="max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="backdrop-blur-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-8 shadow-lg shadow-purple-500/10 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 text-center"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-bento bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-display">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </BentoGrid>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {['Offline-First', 'Privacy-Focused', 'Multi-Agent RAG', 'Instant Answers'].map((feature, i) => (
            <div
              key={i}
              className="px-4 py-2 bento-card text-sm font-medium text-foreground hover:shadow-bento transition-all duration-300 hover:scale-105 cursor-default"
              style={{
                animation: `fadeIn 0.6s ease-out ${i * 0.1}s both`,
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;