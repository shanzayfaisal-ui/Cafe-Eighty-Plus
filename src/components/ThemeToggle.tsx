import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // 1. Check LocalStorage 2. Check System Preference 3. Default to Light
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full shadow-2xl z-[100] transition-all active:scale-95 bg-white dark:bg-stone-900 border border-border group"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {theme === "light" ? (
          <Moon className="text-espresso animate-in zoom-in duration-300" size={20} />
        ) : (
          <Sun className="text-amber-400 animate-in zoom-in duration-300" size={20} />
        )}
      </div>
    </button>
  );
};