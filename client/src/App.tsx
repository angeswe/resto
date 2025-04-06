import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { ToastContainer } from 'react-toastify';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ProjectList from './components/projects/ProjectList';
import ProjectSettings from './components/projects/ProjectSettings';
import EndpointDocs from './components/endpoints/EndpointDocs';
import NewProject from './components/projects/NewProject';
import Docs from './components/Docs';
import { AppContextProvider } from './contexts/AppContextWithTanstack';
import { useAppContext } from './hooks/useAppContext';
import { TabContextProvider } from './contexts/TabContextProvider';
import { queryClient } from './utils/query-client';
import "./index.css";

/**
 * Main application content component
 * Uses context values and renders routes
 */
const AppContent: React.FC = () => {
  const { theme, setTheme } = useAppContext();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty('--theme-mode', theme);
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      <Navbar currentTheme={theme} onThemeChange={setTheme} />
      <main>
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:id/settings" element={<ProjectSettings />} />
          <Route path="/projects/:projectId/endpoints/:endpointId" element={<EndpointDocs />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </div>
  );
};

/**
 * Root application component
 * Sets up providers for the application
 */
const App: React.FC = () => {
  return (
    <HeroUIProvider>
      <Router>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <TabContextProvider>
              <AppContent />
            </TabContextProvider>
          </AppContextProvider>
        </QueryClientProvider>
      </Router>
    </HeroUIProvider>
  );
};

export default App;
