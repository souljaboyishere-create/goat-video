"use client";

import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  strong?: boolean;
  borderGradient?: boolean;
  style?: CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
  strong = false,
  borderGradient = false,
  style,
}: GlassCardProps) {
  const baseClasses = strong
    ? "glass-strong"
    : borderGradient
    ? "glass glass-border-gradient"
    : "glass";

  return (
    <div
      className={`
        ${baseClasses}
        rounded-2xl p-6 lg:p-8
        ${hover ? "hover:bg-white/[0.08] hover:scale-[1.02] hover:shadow-xl transition-all duration-300" : ""}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}

