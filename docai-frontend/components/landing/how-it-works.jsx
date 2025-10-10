import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Brain, ArrowRight, Zap } from 'lucide-react';
import { BentoCard } from '../bento/BentoCard';
import { BentoPanel } from '../bento/BentoPanel';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);
  
  const steps = [
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Simply drag and drop your PDF files or click to browse and upload.",
      color: "from-primary to-accent",
      bgColor: "bg-primary/10"
    },
    {
      icon: Brain,
      title: "AI Processing",
      description: "Our advanced AI analyzes and understands your document content.",
      color: "from-primary to-accent",
      bgColor: "bg-primary/20"
    },
    {
      icon: MessageSquare,
      title: "Start Chatting",
      description: "Ask questions and get intelligent answers from your documents.",
      color: "from-primary to-accent",
      bgColor: "bg-primary/30"
    }
  ];
  
  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [steps.length]);
  
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bento-card">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Three Simple Steps
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight font-display">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with Noetic Vault in minutes, not hours
          </p>
        </div>
        
        {/* Steps - Bento Layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isHovered = hoveredStep === index;
            const Icon = step.icon;
            
            return (
              <BentoPanel
                key={index}
                className={`cursor-pointer transition-all duration-500 ${
                  isActive || isHovered ? 'scale-105' : 'scale-100'
                }`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon container */}
                  <div className="mb-6 relative">
                    <div className={`
                      w-20 h-20 rounded-bento flex items-center justify-center transition-all duration-500
                      ${isActive ? `bg-gradient-to-br ${step.color}` : step.bgColor}
                    `}>
                      <Icon className={`
                        w-10 h-10 transition-all duration-500
                        ${isActive ? 'text-primary-foreground scale-110' : 'text-primary'}
                        ${isHovered ? 'rotate-12' : 'rotate-0'}
                      `} />
                    </div>
                    
                    {/* Step number */}
                    <div className={`
                      absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center
                      font-bold text-sm transition-all duration-500
                      ${isActive ? `bg-gradient-to-br ${step.color} text-primary-foreground scale-110` : 
                        'bg-secondary text-foreground'}
                    `}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Text content */}
                  <h3 className={`
                    text-xl font-bold mb-3 transition-all duration-500 font-display
                    ${isActive ? 'text-gradient' : 'text-foreground'}
                  `}>
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Progress indicator */}
                  {isActive && (
                    <div className="mt-6 w-full h-1 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${step.color} transition-all duration-3000 ease-linear`}
                        style={{
                          width: '100%',
                          animation: 'progress 3s linear'
                        }}
                      />
                    </div>
                  )}
                </div>
              </BentoPanel>
            );
          })}
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-3 mb-12">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${activeStep === index ? 
                  'w-8 bg-gradient-to-r ' + step.color : 
                  'w-2 bg-muted'}
              `}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6 text-lg">
            Ready to experience the magic?
          </p>
          <button className="group inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-bento font-semibold shadow-bento-lg hover:shadow-bento-hover transition-all duration-300 hover:scale-105">
            Try It Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;