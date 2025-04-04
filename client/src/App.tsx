import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ProjectList from './components/projects/ProjectList';
import ProjectSettings from './components/projects/ProjectSettings';
import EndpointDocsPage from './components/endpoints/EndpointDocsPage';
import NewProject from './components/projects/NewProject';
import Docs from './components/Docs';
import { AppContextProvider, useAppContext } from './contexts/AppContext';
import { TabContextProvider } from './contexts/TabContext';
import "./index.css";

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
          <Route path="/projects/:projectId/endpoints/:endpointId" element={<EndpointDocsPage />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HeroUIProvider>
      <Router>
        <AppContextProvider>
          <TabContextProvider>
            <AppContent />
          </TabContextProvider>
        </AppContextProvider>
      </Router>
    </HeroUIProvider>
  );
};

export default App;
