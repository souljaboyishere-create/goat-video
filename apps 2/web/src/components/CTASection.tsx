"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";

export default function CTASection() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <section className="w-full py-6 md:py-8 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {!isAuthenticated && (
          <p className="text-text-muted text-sm mb-4">
            No credit card required • Free trial available
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="group">
                <Button variant="primary" size="lg" className="relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>

              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  See Pricing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects">
                <Button variant="primary" size="lg" className="relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    My Projects
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="lg"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
