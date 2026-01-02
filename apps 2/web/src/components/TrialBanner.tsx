"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";

interface TrialBannerProps {
  onDismiss?: () => void;
}

export default function TrialBanner({ onDismiss }: TrialBannerProps) {
  const { isTrialMode, trialVideosRemaining } = useAuth();

  if (!isTrialMode || trialVideosRemaining === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-amber/10 border-b border-amber/20 px-4 py-3 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-amber text-sm font-medium whitespace-nowrap">
            Trial Mode
          </span>
          <span className="text-text-secondary text-sm hidden sm:inline">
            {trialVideosRemaining} free video{trialVideosRemaining !== 1 ? 's' : ''} remaining. Sign up to unlock unlimited access.
          </span>
          <span className="text-text-secondary text-sm sm:hidden">
            {trialVideosRemaining} free video{trialVideosRemaining !== 1 ? 's' : ''} left
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              View Plans
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-text-muted hover:text-cream transition-colors min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

