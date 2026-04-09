import { create } from "zustand";
import { createTimeEntry, stopTimeEntry, fetchRunningEntry, type TimeEntry } from "@/lib/api/time-entries";
import { useToastStore } from "@/components/toast";

interface TimerState {
  isRunning: boolean;
  seconds: number;
  taskDescription: string;
  selectedProjectId: string | null;
  activeEntryId: string | null;
  activeEntry: TimeEntry | null;
  intervalId: ReturnType<typeof setInterval> | null;

  setTaskDescription: (desc: string) => void;
  setSelectedProjectId: (id: string | null) => void;
  start: () => Promise<void>;
  stop: () => Promise<TimeEntry | null>;
  tick: () => void;
  continueEntry: (entry: TimeEntry) => Promise<void>;
  restore: () => Promise<void>;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  seconds: 0,
  taskDescription: "",
  selectedProjectId: null,
  activeEntryId: null,
  activeEntry: null,
  intervalId: null,

  setTaskDescription: (desc) => set({ taskDescription: desc }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  start: async () => {
    const { taskDescription, selectedProjectId } = get();
    if (!selectedProjectId) return;

    try {
      const entry = await createTimeEntry({
        description: taskDescription || "Untitled task",
        projectId: selectedProjectId,
      });

      const intervalId = setInterval(() => get().tick(), 1000);

      set({
        isRunning: true,
        seconds: 0,
        activeEntryId: entry.id,
        activeEntry: entry,
        intervalId,
      });
    } catch {
      useToastStore.getState().add("Failed to start timer. Check your connection.");
    }
  },

  stop: async () => {
    const { activeEntryId, intervalId } = get();
    if (!activeEntryId) return null;

    if (intervalId) clearInterval(intervalId);

    try {
      const entry = await stopTimeEntry(activeEntryId);

      set({
        isRunning: false,
        seconds: 0,
        activeEntryId: null,
        activeEntry: null,
        intervalId: null,
        taskDescription: "",
      });

      useToastStore.getState().add("Timer stopped — entry saved", "success");
      return entry;
    } catch {
      useToastStore.getState().add("Failed to stop timer. Check your connection.");
      return null;
    }
  },

  tick: () => set((s) => ({ seconds: s.seconds + 1 })),

  continueEntry: async (entry) => {
    const { isRunning } = get();
    if (isRunning) await get().stop();

    set({
      taskDescription: entry.description,
      selectedProjectId: entry.projectId,
    });

    await get().start();
  },

  restore: async () => {
    try {
      const entry = await fetchRunningEntry();
      if (entry && !entry.endTime) {
        const elapsed = Math.floor((Date.now() - new Date(entry.startTime).getTime()) / 1000);
        const intervalId = setInterval(() => get().tick(), 1000);
        set({
          isRunning: true,
          seconds: elapsed,
          taskDescription: entry.description,
          selectedProjectId: entry.projectId,
          activeEntryId: entry.id,
          activeEntry: entry,
          intervalId,
        });
      }
    } catch {
      // silently fail — no running entry
    }
  },

  reset: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      isRunning: false,
      seconds: 0,
      taskDescription: "",
      selectedProjectId: null,
      activeEntryId: null,
      activeEntry: null,
      intervalId: null,
    });
  },
}));
