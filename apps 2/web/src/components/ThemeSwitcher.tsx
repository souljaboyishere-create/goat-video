"use client";

import { useTheme, AccentTheme } from "../contexts/ThemeContext";

const themes: { id: AccentTheme; name: string; color: string }[] = [
  { id: "cyan", name: "Electric Cyan", color: "#00D4FF" },
  { id: "coral", name: "Sunset Coral", color: "#FF6B4A" },
  { id: "violet", name: "Violet Purple", color: "#A855F7" },
  { id: "lime", name: "Neon Lime", color: "#84FF00" },
  { id: "gold", name: "Gold Monochrome", color: "#F5C542" },
];

export default function ThemeSwitcher() {
  const { accentTheme, setAccentTheme } = useTheme();

  return (
    <div 
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <span className="text-xs text-gray-400 font-medium hidden sm:inline tracking-wide uppercase">Theme</span>
      <div className="flex gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setAccentTheme(theme.id)}
            className={`
              rounded-full transition-all duration-300 ease-out
              ${accentTheme === theme.id
                ? "ring-2 ring-white/50 ring-offset-2 ring-offset-black/50 scale-110 shadow-lg"
                : "hover:scale-110 opacity-60 hover:opacity-100"
              }
            `}
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              backgroundColor: theme.color,
              boxShadow: accentTheme === theme.id ? `0 0 20px ${theme.color}50` : undefined,
            }}
            title={theme.name}
            aria-label={`Switch to ${theme.name} theme`}
          />
        ))}
      </div>
    </div>
  );
}

