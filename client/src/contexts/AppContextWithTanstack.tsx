import { createContext, useState, useEffect, FC, ReactNode } from "react";

/**
 * Simplified AppContext type that focuses on UI state
 * Data fetching and mutations are handled by TanStack Query hooks
 */
export interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// Create context
const AppContext = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
}

/**
 * Context provider component that manages application UI state
 * This version is simplified as most data fetching is handled by TanStack Query
 */
export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Theme handling
  useEffect(() => {
    // Sync with system theme on mount
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // The context now only provides theme management
  // All data fetching and mutations are handled by TanStack Query hooks
  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
