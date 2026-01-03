"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Button from "./Button";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStatus();
  const { isTrialMode, trialVideosRemaining } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on project editor pages
  const shouldHide = pathname?.startsWith("/projects/") && pathname !== "/projects" && pathname !== "/projects/new";
  
  if (shouldHide) {
    return null;
  }

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
  ];

  const baseNavClasses = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
  const scrolledClasses = "bg-charcoal/80 backdrop-blur-md border-b border-cream/10";
  const navClasses = `${baseNavClasses} ${isScrolled || isMobileMenuOpen ? scrolledClasses : "bg-transparent"}`;

  const showTrialMode = isTrialMode && trialVideosRemaining !== undefined && trialVideosRemaining > 0;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Logo size="md" />

          {showTrialMode && (
            <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 min-w-0">
              <span className="text-amber text-xs md:text-sm font-medium whitespace-nowrap">
                Trial Mode
              </span>
              <span className="text-text-secondary text-xs md:text-sm hidden sm:inline truncate">
                {trialVideosRemaining} free video{trialVideosRemaining !== 1 ? 's' : ''} remaining
              </span>
              <Link href="/login" className="hidden md:inline-block">
                <Button variant="primary" size="sm" className="whitespace-nowrap">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {!showTrialMode && <div className="flex-1" />}

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-cream transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Try Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/projects">
                <Button variant="primary" size="sm" className="whitespace-nowrap">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden min-h-touch min-w-touch flex items-center justify-center text-cream"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <>
            {/* Backdrop - smooth gradient with blur */}
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-lg z-40 md:hidden transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu - connected to navbar, no gap */}
            <div className="md:hidden pb-6 relative z-50 animate-slide-down -mx-4 sm:-mx-6 lg:-mx-8" style={{ background: 'linear-gradient(to bottom, rgba(26, 26, 26, 0.8) 0%, rgba(24, 24, 24, 0.95) 100%)', backdropFilter: 'blur(12px)' }}>
              <div className="relative">
                {showTrialMode && (
                  <div className="flex items-center justify-between gap-3 pt-5 px-6 pb-4 border-b border-amber/20" style={{ background: 'linear-gradient(to right, rgba(232, 168, 73, 0.12) 0%, rgba(232, 168, 73, 0.08) 50%, rgba(232, 168, 73, 0.04) 100%)' }}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-amber text-xs font-medium whitespace-nowrap">
                        Trial Mode
                      </span>
                      <span className="text-text-secondary text-xs truncate">
                        {trialVideosRemaining} free video{trialVideosRemaining !== 1 ? 's' : ''} left
                      </span>
                    </div>
                    <Link href="/login">
                      <Button variant="primary" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-0.5 pt-5 px-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-cream hover:text-amber transition-all duration-200 text-sm font-medium min-h-touch flex items-center py-3.5 px-5 rounded-lg -mx-1 hover:bg-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-3 pt-5 pb-3 border-t border-cream/10 mt-3 px-1">
                    {!isAuthenticated ? (
                      <>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full">
                            Try Free
                          </Button>
                        </Link>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="secondary" size="sm" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="primary" size="sm" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
