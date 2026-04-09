"use client";

import { useEffect } from "react";
import { useProjectsStore } from "@/store/projects-store";
import { useEntriesStore } from "@/store/entries-store";
import { useTimerStore } from "@/store/timer-store";
import { TimerInput } from "@/components/timer-input";
import { TimerDisplay } from "@/components/timer-display";
import { TimeEntryList } from "@/components/time-entry-list";

export default function Home() {
  const { load: loadProjects } = useProjectsStore();
  const { loadToday } = useEntriesStore();
  const { restore } = useTimerStore();

  useEffect(() => {
    loadProjects();
    loadToday();
    restore();
  }, [loadProjects, loadToday, restore]);

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-6 py-12 relative z-10 overflow-x-clip">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/0 rounded-full blur-[120px] pointer-events-none transition-opacity duration-1000 opacity-0 hero-bg-glow z-0" />

      <section className="w-full flex flex-col items-center justify-center pt-8 pb-16">
        <TimerInput />
        <div className="mt-16 sm:mt-24 mb-16">
          <TimerDisplay />
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-base-800 to-transparent my-8 opacity-50" />

      <TimeEntryList />
    </div>
  );
}
