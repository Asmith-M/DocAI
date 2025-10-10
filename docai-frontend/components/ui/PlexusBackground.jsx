import React, { useEffect, useRef } from 'react';

export const PlexusBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initNodes();
    };

    // Initialize nodes in a grid pattern
    const initNodes = () => {
      nodesRef.current = [];
      const spacing = 80;
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          nodesRef.current.push({
            x: i * spacing + spacing / 2,
            y: j * spacing + spacing / 2,
            baseX: i * spacing + spacing / 2,
            baseY: j * spacing + spacing / 2,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            radius: 2,
            opacity: 0.3 + Math.random() * 0.3,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Calculate distance between two points
    const distance = (x1, y1, x2, y2) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Find nearest nodes to mouse
    const findNearestNodes = (count = 7) => {
      const distances = nodesRef.current.map((node, index) => ({
        index,
        dist: distance(node.x, node.y, mouseRef.current.x, mouseRef.current.y),
      }));
      distances.sort((a, b) => a.dist - b.dist);
      return distances.slice(0, count).map(d => d.index);
    };

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Check if dark mode
      const isDark = document.documentElement.classList.contains('dark');
      const nodeColor = isDark ? 'rgba(151, 135, 243, 0.6)' : 'rgba(124, 110, 224, 0.4)';
      const lineColor = isDark ? 'rgba(151, 135, 243, 0.3)' : 'rgba(124, 110, 224, 0.2)';

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Subtle floating animation
        node.pulsePhase += 0.02;
        const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;
        
        // Gentle drift
        node.x += node.vx;
        node.y += node.vy;

        // Bounce back to base position
        const dx = node.baseX - node.x;
        const dy = node.baseY - node.y;
        node.x += dx * 0.01;
        node.y += dy * 0.01;

        // Draw node with pulsating glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 8 * pulse;
        ctx.shadowColor = nodeColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw lines to nearest nodes from mouse
      const nearestIndices = findNearestNodes(7);
      nearestIndices.forEach((index) => {
        const node = nodesRef.current[index];
        const dist = distance(node.x, node.y, mouseRef.current.x, mouseRef.current.y);
        const maxDist = 200;

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.5;
          ctx.beginPath();
          ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = isDark 
            ? `rgba(151, 135, 243, ${opacity})` 
            : `rgba(124, 110, 224, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        background: 'transparent',
        zIndex: 0
      }}
    />
  );
};

export default PlexusBackground;