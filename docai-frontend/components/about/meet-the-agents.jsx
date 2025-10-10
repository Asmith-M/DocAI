"use client"

import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"

export function MeetTheAgents() {
  const teamMembers = [
    { name: 'Sezal Sharma', role: 'Documentation Lead & Developer', color: 'from-purple-400 to-purple-600' },
    { name: 'Asmith Mahendrakar', role: 'Research Lead & Developer', color: 'from-purple-500 to-purple-700' }
  ];

  return (
    <section className="py-32 px-4 relative mb-24 bg-white/85 backdrop-blur-lg dark:bg-slate-900/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimationWrapper>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center text-slate-900 dark:text-white mb-16">
            Meet the Team
          </h2>
        </ScrollAnimationWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <ScrollAnimationWrapper key={index} delay={index * 0.1}>
            <div className="group backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.color} mx-auto mb-6 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-light">
                  {member.role}
                </p>
              </div>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
