import { create } from "zustand";
import {
  fetchTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  type TimeEntry,
} from "@/lib/api/time-entries";
import { useToastStore } from "@/components/toast";

interface EntriesState {
  entries: TimeEntry[];
  loading: boolean;
  error: string | null;
  loadToday: () => Promise<void>;
  loadRange: (from: string, to: string) => Promise<void>;
  update: (id: string, data: Partial<{ description: string; projectId: string; startTime: string; endTime: string }>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  loadToday: async () => {
    set({ loading: true, error: null });
    try {
      const today = new Date().toISOString().split("T")[0];
      const entries = await fetchTimeEntries({ date: today });
      set({ entries, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  loadRange: async (from, to) => {
    set({ loading: true, error: null });
    try {
      const entries = await fetchTimeEntries({ from, to });
      set({ entries, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  update: async (id, data) => {
    await updateTimeEntry(id, data);
    await get().refresh();
    useToastStore.getState().add("Entry updated", "success");
  },

  remove: async (id) => {
    await deleteTimeEntry(id);
    set({ entries: get().entries.filter((e) => e.id !== id) });
    useToastStore.getState().add("Entry deleted", "success");
  },

  refresh: async () => {
    const today = new Date().toISOString().split("T")[0];
    const entries = await fetchTimeEntries({ date: today });
    set({ entries });
  },
}));
