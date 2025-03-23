// client/src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { projectsApi } from "../utils/api";
import { toast } from "react-toastify";

// Create context
const AppContext = createContext();

// Context provider component
export const AppContextProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects on initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new project
  const addProject = async (projectData) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectsApi.createProject(projectData);
      setProjects([...projects, newProject]);
      toast.success("Project created successfully");
      return newProject;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to create project";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProject = async (projectId, projectData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectsApi.updateProject(
        projectId,
        projectData
      );
      setProjects(
        projects.map((project) =>
          project.projectId === projectId ? updatedProject : project
        )
      );
      toast.success("Project updated successfully");
      return updatedProject;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update project";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      await projectsApi.deleteProject(projectId);
      setProjects(
        projects.filter((project) => project.projectId !== projectId)
      );
      toast.success("Project deleted successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to delete project";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default AppContext;
