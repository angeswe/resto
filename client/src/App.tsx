import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProjectList from './components/projects/ProjectList';
import ProjectSettings from './components/projects/ProjectSettings';
import EndpointDocs from './components/endpoints/EndpointDocs';
import NewProject from './components/projects/NewProject';
import { AppContextProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContextProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ProjectList />} />
                <Route path="/projects/new" element={<NewProject />} />
                <Route path="/project/:id/settings" element={<ProjectSettings />} />
                <Route path="/projects/:projectId/endpoints/:endpointId" element={<EndpointDocs />} />
              </Routes>
            </main>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </AppContextProvider>
    </ThemeProvider>
  );
};

export default App;
