import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AppSettings } from "./types";

interface AppStore {
  // Estado
  settings: AppSettings;

  // Actions para configurações
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

// Configurações padrão
const defaultSettings: AppSettings = {
  theme: "light",
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // Estado inicial
        settings: defaultSettings,

        // Actions para configurações
        updateSettings: (newSettings) => {
          return set(
            (state) => ({
              settings: { ...state.settings, ...newSettings },
            }),
            false,
            "app/updateSettings"
          );
        },

        toggleTheme: () => {
          return set(
            (state) => {
              const currentTheme = state.settings.theme;
              let nextTheme: "light" | "dark";

              switch (currentTheme) {
                case "light":
                  nextTheme = "dark";
                  break;
                case "dark":
                  nextTheme = "light";
                  break;
                default:
                  nextTheme = "light";
              }

              return {
                settings: {
                  ...state.settings,
                  theme: nextTheme,
                },
              };
            },
            false,
            "app/toggleTheme"
          );
        },

        setTheme: (theme) => {
          return set(
            (state) => ({
              settings: {
                ...state.settings,
                theme,
              },
            }),
            false,
            "app/setTheme"
          );
        },
      }),

      {
        name: "app-storage",
        partialize: (state) => ({
          settings: state.settings,
        }),
      }
    ),
    {
      name: "app-store",
    }
  )
);
