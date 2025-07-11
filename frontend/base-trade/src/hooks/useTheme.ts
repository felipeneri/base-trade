import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";

export function useTheme() {
  const { settings, setTheme, toggleTheme } = useAppStore();
  const theme = settings.theme;

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove as classes anteriores
    root.classList.remove("light", "dark");

    // Adiciona a classe do tema selecionado
    root.classList.add(theme);
  }, [theme]);

  // Escuta mudanças na preferência do sistema quando o tema for "system"
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
