// client/src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Provider
import { AppContextProvider } from "./contexts/AppContext";

// Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./components/Home";
import ProjectCreation from "./components/ProjectCreation";
import ProjectSettings from "./components/ProjectSettings";
import ApiDocumentation from "./components/docs/ApiDocumentation";

const App = () => {
  return (
    <AppContextProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <Header />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects/new" element={<ProjectCreation />} />
              <Route
                path="/projects/:projectId/settings"
                element={<ProjectSettings />}
              />
              <Route
                path="/projects/:projectId"
                element={<ApiDocumentation />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AppContextProvider>
  );
};

export default App;
