"use client";

export default function AnimatedBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ zIndex: 0 }} 
      aria-hidden="true"
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at top, rgba(58, 107, 124, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(232, 168, 73, 0.08) 0%, transparent 50%)",
        }}
      />
      {/* Film grain texture */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

