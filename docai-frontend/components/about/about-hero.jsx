"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Shield, Users } from 'lucide-react';
import { ScrollAnimationWrapper } from '@/components/shared/scroll-animation-wrapper';

// Animated gradient mesh background
const AnimatedMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Create gradient mesh effect
      const gradient1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time * 0.001) * 100,
        height * 0.3 + Math.cos(time * 0.0015) * 100,
        0,
        width * 0.3,
        height * 0.3,
        width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(216, 180, 254, 0.15)');
      gradient1.addColorStop(1, 'rgba(216, 180, 254, 0)');

      const gradient2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(time * 0.0012) * 80,
        height * 0.7 + Math.sin(time * 0.001) * 80,
        0,
        width * 0.7,
        height * 0.7,
        width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(168, 85, 247, 0.1)');
      gradient2.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      time++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Floating particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/20"
          style={{
            left: particle.left,
            bottom: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s infinite ease-in-out`,
            animationDelay: particle.animationDelay
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export function AboutHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const values = [
    {
      icon: Sparkles,
      title: 'Advanced AI',
      description: 'Powered by state-of-the-art language models and neural networks for intelligent document analysis.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your documents stay private and secure, processed entirely offline on your device.'
    },
    {
      icon: Users,
      title: 'Multi-Agent System',
      description: 'Specialized AI agents work together to deliver accurate, contextual responses from your documents.'
    }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-32 relative overflow-hidden mb-24 bg-white/85 backdrop-blur-lg dark:bg-slate-900/60 backdrop-blur-lg">
      <AnimatedMesh />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto w-full text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
          <span className="text-slate-900 dark:text-white">Our Mission to Reinvent</span>
          <br />
          <span
            className="bg-gradient-to-br from-purple-300 via-purple-500 to-purple-700 bg-clip-text text-transparent"
            style={{
              transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`
            }}
          >
            Document Intelligence
          </span>
        </h1>
        <p
          className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-light"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
          }}
        >
          We're building the future of document interaction, combining advanced AI with uncompromising privacy to help you unlock insights from your documents like never before.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <ScrollAnimationWrapper key={index} delay={index * 0.1}>
                <div className="group backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 text-center">
                  <div className="flex justify-center">
                    <Icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </ScrollAnimationWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
