"use client";

import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  grain?: boolean;
  style?: CSSProperties;
}

export default function Card({
  children,
  className = "",
  hover = false,
  grain = false,
  style,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl p-6 lg:p-8
        bg-gradient-to-br from-charcoal-light/90 to-charcoal-light/70 backdrop-blur-md
        border border-cream/10
        transition-all duration-300
        ${hover ? "hover:border-amber/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]" : ""}
        ${grain ? "relative" : ""}
        ${className}
      `}
      style={style}
    >
      {grain && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            zIndex: 1,
          }}
        />
      )}
      <div className={grain ? "relative z-10" : ""}>
        {children}
      </div>
    </div>
  );
}

