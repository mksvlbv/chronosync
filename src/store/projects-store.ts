import { create } from "zustand";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "@/lib/api/projects";
import { useToastStore } from "@/components/toast";

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
    useToastStore.getState().add(`Project "${data.name}" created`, "success");
    return project as unknown as Project;
  },

  update: async (id, data) => {
    await updateProject(id, data);
    await get().load();
    useToastStore.getState().add("Project updated", "success");
  },

  remove: async (id) => {
    const name = get().projects.find(p => p.id === id)?.name;
    await deleteProject(id);
    set({ projects: get().projects.filter((p) => p.id !== id) });
    useToastStore.getState().add(`Project "${name}" deleted`, "success");
  },
}));
