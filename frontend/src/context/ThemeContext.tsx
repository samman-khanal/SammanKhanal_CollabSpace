import React, { createContext, useContext, useEffect, useState } from "react";
export type Theme = "light" | "dark" | "system";
export type AccentPalette = "indigo" | "violet" | "blue" | "sky" | "rose" | "emerald" | "amber" | "pink" | "teal";
interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  accentPalette: AccentPalette;
  setAccentPalette: (p: AccentPalette) => void;
}
const STORAGE_KEY = "collabspace_theme";
const PALETTE_KEY = "collabspace_palette";
const ThemeContext = createContext<ThemeContextType | null>(null);
//* Function for get system theme
function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}
//* Function for resolve
function resolve(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}
//* Function for theme provider
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  //* Function for theme provider
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {}
    return "light";
  });
  const [resolvedTheme, setResolved] = useState<"light" | "dark">(resolve(theme));
  //* Function for theme provider
  const [accentPalette, setAccentPaletteState] = useState<AccentPalette>(() => {
    try {
      const stored = localStorage.getItem(PALETTE_KEY) as AccentPalette | null;
      const valid: AccentPalette[] = ["indigo", "violet", "blue", "sky", "rose", "emerald", "amber", "pink", "teal"];
      if (stored && valid.includes(stored)) return stored;
    } catch {}
    return "indigo";
  });
  //* Function for theme provider
  useEffect(() => {
    const r = resolve(theme);
    setResolved(r);
    const root = document.documentElement;
    if (r === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  //* Function for theme provider
  useEffect(() => {
    if (accentPalette === "indigo") {
      document.documentElement.removeAttribute("data-palette");
    } else {
      document.documentElement.setAttribute("data-palette", accentPalette);
    }
  }, [accentPalette]);
  //* Function for theme provider
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    //* Function for handler
    const handler = () => {
      const r = resolve("system");
      setResolved(r);
      if (r === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mq.addEventListener("change", handler);
    //* Function for theme provider
    return () => mq.removeEventListener("change", handler);
  }, [theme]);
  //* Function for set theme
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    try {
      const raw = localStorage.getItem("collabspace_preferences");
      if (raw) {
        const prefs = JSON.parse(raw);
        prefs.theme = t;
        localStorage.setItem("collabspace_preferences", JSON.stringify(prefs));
      }
    } catch {}
  };
  //* Function for set accent palette
  const setAccentPalette = (p: AccentPalette) => {
    setAccentPaletteState(p);
    localStorage.setItem(PALETTE_KEY, p);
    try {
      const raw = localStorage.getItem("collabspace_preferences");
      if (raw) {
        const prefs = JSON.parse(raw);
        prefs.accentPalette = p;
        localStorage.setItem("collabspace_preferences", JSON.stringify(prefs));
      }
    } catch {}
  };
  return <ThemeContext.Provider value={{
    theme,
    resolvedTheme,
    setTheme,
    accentPalette,
    setAccentPalette
  }}>
      {children}
    </ThemeContext.Provider>;
};
//* Function for use theme
export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};