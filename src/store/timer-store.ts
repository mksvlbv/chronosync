import { create } from "zustand";
import { createTimeEntry, stopTimeEntry, type TimeEntry } from "@/lib/api/time-entries";

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
  },

  stop: async () => {
    const { activeEntryId, intervalId } = get();
    if (!activeEntryId) return null;

    if (intervalId) clearInterval(intervalId);

    const entry = await stopTimeEntry(activeEntryId);

    set({
      isRunning: false,
      seconds: 0,
      activeEntryId: null,
      activeEntry: null,
      intervalId: null,
      taskDescription: "",
    });

    return entry;
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
