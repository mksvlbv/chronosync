"use client";

import { useTimerStore } from "@/store/timer-store";
import { useEntriesStore } from "@/store/entries-store";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Play, Stop } from "@phosphor-icons/react";

export function TimerDisplay() {
  const { isRunning, seconds, start, stop, selectedProjectId } = useTimerStore();
  const { loadToday } = useEntriesStore();

  const handleToggle = async () => {
    if (isRunning) {
      await stop();
      await loadToday();
    } else {
      if (!selectedProjectId) return;
      await start();
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      {isRunning && (
        <div className="absolute -top-8 flex items-center gap-2 transition-opacity duration-500">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
          </span>
          <span className="text-brand-400 text-sm font-medium tracking-wide uppercase">Tracking</span>
        </div>
      )}

      <div className="flex items-baseline justify-center w-full select-none">
        <h1
          className={cn(
            "text-[5rem] sm:text-[8rem] lg:text-[10rem] leading-none font-mono font-extralight tracking-tighter text-white transition-all duration-500",
            isRunning && "text-brand-400"
          )}
          style={isRunning ? { textShadow: "0 0 40px rgba(52, 211, 153, 0.4)" } : undefined}
        >
          {formatDuration(seconds)}
        </h1>
      </div>

      <div className="mt-16 sm:mt-24 relative z-10">
        <button
          onClick={handleToggle}
          disabled={!selectedProjectId && !isRunning}
          className={cn(
            "group relative flex items-center justify-center gap-3 px-12 sm:px-16 py-5 rounded-full text-xl sm:text-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed",
            isRunning
              ? "bg-danger-500 hover:bg-danger-400"
              : "bg-brand-500 hover:bg-brand-400"
          )}
          style={{
            boxShadow: isRunning
              ? "0 0 40px -10px rgba(239, 68, 68, 0.5)"
              : "0 0 40px -10px rgba(16, 185, 129, 0.5)",
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {isRunning ? (
              <Stop size={24} weight="fill" />
            ) : (
              <Play size={24} weight="fill" />
            )}
            <span>{isRunning ? "Stop Tracker" : "Start"}</span>
          </span>
        </button>

        {isRunning && (
          <div className="absolute inset-0 bg-danger-500/40 blur-[30px] -z-10 rounded-full" />
        )}
      </div>
    </div>
  );
}
