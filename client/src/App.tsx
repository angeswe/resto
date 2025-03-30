import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HeroUIProvider } from '@heroui/react';

import Navbar from './components/Navbar';
import ProjectList from './components/projects/ProjectList';
import ProjectSettings from './components/projects/ProjectSettings';
import EndpointDocs from './components/endpoints/EndpointDocs';
import NewProject from './components/projects/NewProject';
import NewEndpoint from './components/endpoints/NewEndpoint';
import Docs from './components/Docs';
import { AppContextProvider } from './contexts/AppContext';
import "./index.css";

const App: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    // Sync with system theme on mount
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <HeroUIProvider>
      <AppContextProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar currentTheme={theme} onThemeChange={setTheme} />
            <main>
              <Routes>
                <Route path="/" element={<ProjectList />} />
                <Route path="/projects/new" element={<NewProject />} />
                <Route path="/projects/:id/settings" element={<ProjectSettings />} />
                <Route path="/projects/:projectId/endpoints/new" element={<NewEndpoint />} />
                <Route path="/projects/:projectId/endpoints/:endpointId" element={<EndpointDocs />} />
                <Route path="/docs" element={<Docs />} />
              </Routes>
            </main>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </AppContextProvider>
    </HeroUIProvider>
  );
};

export default App;
