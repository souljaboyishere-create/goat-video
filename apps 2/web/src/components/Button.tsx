"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-touch",
    md: "px-6 py-3 text-base min-h-touch",
    lg: "px-8 py-4 text-lg min-h-touch",
  };

  const baseClasses = "rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:ring-offset-2 focus:ring-offset-charcoal disabled:opacity-50 disabled:cursor-not-allowed";

  if (variant === "primary") {
    return (
      <button
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          bg-amber text-charcoal
          hover:bg-amber-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(232,168,73,0.3)]
          ${className}
        `}
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
          ${sizeClasses[size]}
          bg-transparent text-cream border border-cream/20
          hover:border-cream/40 hover:bg-cream/5
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
        ${sizeClasses[size]}
        bg-transparent text-text-secondary
        hover:text-cream
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

