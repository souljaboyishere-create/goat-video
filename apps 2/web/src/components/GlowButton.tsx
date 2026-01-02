"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export default function GlowButton({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: GlowButtonProps) {
  const { themeConfig } = useTheme();

  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";

  if (variant === "primary") {
    return (
      <button
        className={`
          ${baseClasses}
          accent-gradient text-black
          hover:scale-105 hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${className}
        `}
        style={{
          boxShadow: disabled
            ? "none"
            : `0 0 20px ${themeConfig.glow}, 0 4px 6px rgba(0, 0, 0, 0.3)`,
        }}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        className={`
          ${baseClasses}
          glass border border-white/20 text-white
          hover:bg-white/10 hover:border-white/30
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`
        ${baseClasses}
        text-white/70 hover:text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

