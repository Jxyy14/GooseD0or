import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("goosedoor-theme") as Theme;
    if (stored) return stored;
    // Default to light
    return "light";
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("goosedoor-theme", theme);
    
    // Update document class
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

