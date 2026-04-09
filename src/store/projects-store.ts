import { create } from "zustand";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "@/lib/api/projects";

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  add: (data: { name: string; color: string; client?: string }) => Promise<Project>;
  update: (id: string, data: Partial<{ name: string; color: string; client: string }>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await fetchProjects();
      set({ projects, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (data) => {
    const project = await createProject(data);
    await get().load();
    return project as unknown as Project;
  },

  update: async (id, data) => {
    await updateProject(id, data);
    await get().load();
  },

  remove: async (id) => {
    await deleteProject(id);
    set({ projects: get().projects.filter((p) => p.id !== id) });
  },
}));
