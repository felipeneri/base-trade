// Hooks personalizados para acessar stores do Zustand
import { useAppStore } from "../stores/useAppStore";

// Hook para estado global de loading (mantido para compatibilidade, mas pode usar React Query)
export function useGlobalLoading() {
  // Como removemos isLoading do app store, retornamos false por padrão
  // O loading agora é gerenciado individualmente pelo React Query
  return false;
}

// Hook para erros globais (mantido para compatibilidade, mas pode usar React Query)
export function useGlobalError() {
  // Como removemos error do app store, retornamos null por padrão
  // Os erros agora são gerenciados individualmente pelo React Query
  return null;
}

// Hooks para configurações da aplicação
export function useAppSettings() {
  return useAppStore((state) => state.settings);
}

export function useTheme() {
  const settings = useAppStore((state) => state.settings);
  const setTheme = useAppStore((state) => state.setTheme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return {
    theme: settings.theme,
    setTheme,
    toggleTheme,
  };
}

// Hooks para notificações
export function useNotifications() {
  return useAppStore((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    markAsRead: state.markNotificationAsRead,
    removeNotification: state.removeNotification,
    clearAll: state.clearAllNotifications,
  }));
}
