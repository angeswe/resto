import { createContext, useContext, useState, useEffect, FC, ReactNode } from "react";
import { AppContextType } from "../types/project";
import { useProjects } from "../hooks/useProjects";
import { useEndpoints } from "../hooks/useEndpoints";

// Create context
const AppContext = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
}

// Context provider component
export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize hooks
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const {
    loading: endpointsLoading,
    error: endpointsError,
    endpoints,
    getEndpoint,
    getEndpoints,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
  } = useEndpoints();

  // Theme handling
  useEffect(() => {
    // Sync with system theme on mount
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Combine loading and error states
  const isLoading = projectsLoading || endpointsLoading;
  const error = projectsError || endpointsError;

  return (
    <AppContext.Provider
      value={{
        projects,
        endpoints,
        theme,
        setTheme,
        loading: isLoading,
        error,
        fetchProjects,
        getEndpoint,
        getEndpoints,
        addProject,
        updateProject,
        deleteProject,
        addEndpoint,
        updateEndpoint,
        deleteEndpoint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default AppContext;
