import React from 'react';

export const GridBackground = () => {
  return (
    <>
      {/* Light Mode: Subtle Dot Grid */}
      <div className="fixed inset-0 -z-10 dark:hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Dark Mode: Aurora Grid */}
      <div className="fixed inset-0 -z-10 hidden dark:block">
        {/* Purple Aurora Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-50 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(270 80% 70% / 0.4) 0%, transparent 70%)'
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
      </div>
    </>
  );
};

export default GridBackground;