"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`font-serif font-semibold text-cream hover:text-amber transition-colors ${sizeClasses[size]} ${className}`}>
      VideoAI
    </Link>
  );
}

