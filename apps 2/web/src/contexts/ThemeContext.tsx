"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AccentTheme = "cyan" | "coral" | "violet" | "lime" | "gold";

interface ThemeConfig {
  primary: string;
  primaryRgb: string;
  secondary: string;
  glow: string;
}

const themeConfigs: Record<AccentTheme, ThemeConfig> = {
  cyan: {
    primary: "#00D4FF",
    primaryRgb: "0, 212, 255",
    secondary: "#00B4D8",
    glow: "rgba(0, 212, 255, 0.3)",
  },
  coral: {
    primary: "#FF6B4A",
    primaryRgb: "255, 107, 74",
    secondary: "#FF8E6B",
    glow: "rgba(255, 107, 74, 0.3)",
  },
  violet: {
    primary: "#A855F7",
    primaryRgb: "168, 85, 247",
    secondary: "#9333EA",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  lime: {
    primary: "#84FF00",
    primaryRgb: "132, 255, 0",
    secondary: "#A4FF33",
    glow: "rgba(132, 255, 0, 0.3)",
  },
  gold: {
    primary: "#F5C542",
    primaryRgb: "245, 197, 66",
    secondary: "#F7D366",
    glow: "rgba(245, 197, 66, 0.3)",
  },
};

interface ThemeContextType {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>("cyan");

  // Helper function to apply theme to CSS variables
  const applyThemeToCSS = (theme: AccentTheme) => {
    const config = themeConfigs[theme];
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--accent-primary", config.primaryRgb);
      document.documentElement.style.setProperty("--accent-primary-hex", config.primary);
      document.documentElement.style.setProperty(
        "--accent-secondary",
        theme === "cyan" ? "0, 180, 216" :
        theme === "coral" ? "255, 142, 107" :
        theme === "violet" ? "147, 51, 234" :
        theme === "lime" ? "164, 255, 51" :
        "247, 211, 102"
      );
    }
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("accent-theme") as AccentTheme;
      if (stored && themeConfigs[stored]) {
        setAccentThemeState(stored);
        applyThemeToCSS(stored);
      } else {
        // Apply default theme
        applyThemeToCSS("cyan");
      }
    }
  }, []);

  const setAccentTheme = (theme: AccentTheme) => {
    setAccentThemeState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("accent-theme", theme);
    }
    applyThemeToCSS(theme);
  };

  const themeConfig = themeConfigs[accentTheme];

  return (
    <ThemeContext.Provider
      value={{
        accentTheme,
        setAccentTheme,
        themeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

