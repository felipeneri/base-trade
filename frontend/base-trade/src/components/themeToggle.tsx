import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Botões individuais para cada tema */}
      <div
        className={`flex gap-1 items-center cursor-pointer transition-transform duration-500 ${
          theme === "dark" ? "rotate-180" : "rotate-0"
        }`}
      >
        {theme === "dark" ? (
          <Button variant="ghost" size="sm" onClick={() => toggleTheme()}>
            <SunIcon className="w-6 h-6 text-yellow-500" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => toggleTheme()}>
            <MoonIcon className="w-6 h-6 text-blue-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
