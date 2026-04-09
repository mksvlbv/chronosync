"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useEntriesStore } from "@/store/entries-store";

export function KeyboardShortcuts() {
  const { isRunning, start, stop, selectedProjectId } = useTimerStore();
  const { loadToday } = useEntriesStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) {
          stop().then(() => loadToday());
        } else if (selectedProjectId) {
          start();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, start, stop, selectedProjectId, loadToday]);

  return null;
}
