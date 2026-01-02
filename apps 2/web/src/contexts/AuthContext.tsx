"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isTrialMode: boolean;
  trialVideosRemaining: number;
  setTrialVideosRemaining: (count: number) => void;
  decrementTrialVideo: () => void;
  userPlan: "free" | "pro" | "studio" | null;
  setUserPlan: (plan: "free" | "pro" | "studio" | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTrialMode, setIsTrialMode] = useState(false);
  const [trialVideosRemaining, setTrialVideosRemaining] = useState(1);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "studio" | null>(null);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      setIsTrialMode(false);
      // TODO: Fetch user plan from API
      const plan = localStorage.getItem("userPlan") as "free" | "pro" | "studio" | null;
      setUserPlan(plan);
    } else {
      setIsAuthenticated(false);
      // Check if user has used trial
      const trialUsed = localStorage.getItem("trialUsed") === "true";
      if (!trialUsed) {
        setIsTrialMode(true);
        setTrialVideosRemaining(1);
      } else {
        setIsTrialMode(false);
        setTrialVideosRemaining(0);
      }
    }
  }, []);

  const decrementTrialVideo = () => {
    if (trialVideosRemaining > 0) {
      const newCount = trialVideosRemaining - 1;
      setTrialVideosRemaining(newCount);
      if (newCount === 0) {
        localStorage.setItem("trialUsed", "true");
        setIsTrialMode(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isTrialMode,
        trialVideosRemaining,
        setTrialVideosRemaining,
        decrementTrialVideo,
        userPlan,
        setUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

