"use client"

import { Users, Sparkles, ArrowRight } from 'lucide-react';
import { ScrollAnimationWrapper } from '@/components/shared/scroll-animation-wrapper';

export function JoinUs() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        {/* Main CTA container */}
        <ScrollAnimationWrapper>
          <div className="relative rounded-[3rem] overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
              {/* Floating orbs */}
              {[
                { size: 300, left: '10%', top: '20%', delay: 0, duration: 20 },
                { size: 200, right: '15%', top: '30%', delay: 2, duration: 18 },
                { size: 250, left: '20%', bottom: '15%', delay: 1, duration: 22 },
                { size: 180, right: '10%', bottom: '20%', delay: 3, duration: 19 }
              ].map((orb, i) => (
                <div
                  key={i}
                  className="absolute rounded-full blur-3xl opacity-30"
                  style={{
                    width: orb.size,
                    height: orb.size,
                    left: orb.left,
                    right: orb.right,
                    top: orb.top,
                    bottom: orb.bottom,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                    animation: `float ${orb.duration}s ease-in-out infinite`,
                    animationDelay: `${orb.delay}s`
                  }}
                />
              ))}
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-full shadow-lg">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Join Our Team • Shape the Future
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white text-center mb-6 leading-tight">
                Help Us Shape the
                <br />
                <span className="inline-block relative mt-2">
                  Future
                  <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-yellow-300 animate-pulse" />
                </span>
              </h2>

              {/* Description */}
              <p className="text-xl md:text-2xl text-white/90 text-center mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Join our mission to revolutionize document intelligence. We're looking for passionate individuals to help build the next generation of AI-powered tools.
              </p>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button className="group relative px-10 py-5 bg-white hover:bg-gray-50 text-violet-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden">
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  {/* Button content */}
                  <span className="relative flex items-center gap-3">
                    <Sparkles className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12`} />
                    View Open Roles
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl">
                    <div className="absolute inset-0 rounded-2xl border-4 border-white/50 transition-all duration-300 group-hover:scale-105 group-hover:opacity-0" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(5deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(-5deg);
          }
        }
      `}</style>
    </section>
  );
}
