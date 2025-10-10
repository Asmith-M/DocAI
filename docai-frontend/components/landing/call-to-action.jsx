import React from 'react';
import { ArrowRight, FileText, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const stats = [
    { icon: Users, label: "For Teams & Individuals", value: "Collaborate" },
    { icon: FileText, label: "Supports All Major Formats", value: "Versatile" },
    { icon: TrendingUp, label: "Boost Your Productivity", value: "Efficient" }
  ];
  
  const socialProofImages = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1980&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
  ];

  return (
    <section 
      className="group/spotlight relative bg-muted py-32 px-4 overflow-hidden"
      style={{
        '--spotlight-x': '50%',
        '--spotlight-y': '50%',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
      }}
    >
      {/* The spotlight effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-500 opacity-0 group-hover/spotlight:opacity-100"
        style={{
          // Adjusted spotlight color for better visibility on both themes
          background: 'radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), hsl(var(--primary) / 0.15), transparent 80%)'
        }}
      />
      
      <div className="container mx-auto max-w-6xl relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full mb-8 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Privacy-First • Offline-Ready • Open Source
          </span>
        </div>
        
        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
          Unlock the Power of Your Documents
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light">
          Noetic Vault turns static files into dynamic conversations. Ask questions, extract insights, and get instant answers with citations—all securely on your own machine.
        </p>
        
        {/* CTA Button */}
        <Link to="/upload">
          <button className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="relative flex items-center gap-2">
              <Zap className="w-5 h-5 transition-transform duration-300 group-hover:animate-pulse" />
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </Link>
        
        {/* Social Proof */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <div className="flex -space-x-4">
            {socialProofImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`User ${i+1}`}
                className="w-12 h-12 rounded-full border-2 border-background object-cover shadow-lg"
              />
            ))}
          </div>
          <span className="text-muted-foreground">
            Trusted by over <span className="font-semibold text-foreground">10,000+</span> professionals
          </span>
        </div>
        
        {/* Simplified Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm hover:bg-secondary transition-colors duration-300"
              >
                {/* FIX: Added mx-auto to center the icon */}
                <Icon className="w-7 h-7 text-primary mb-3 mx-auto" />
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

export default CallToAction;