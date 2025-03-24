
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  
  createProject: (name: string) => Project;
  setCurrentProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      
      createProject: (name: string) => {
        const newProject: Project = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));
        
        return newProject;
      },
      
      setCurrentProject: (projectId: string) => {
        const project = get().projects.find((p) => p.id === projectId);
        set({ currentProject: project || null });
      },
      
      getProjectById: (projectId: string) => {
        return get().projects.find((p) => p.id === projectId);
      },
    }),
    {
      name: "project-store",
    }
  )
);
