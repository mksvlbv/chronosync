"use client";

import { useState, useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useProjectsStore } from "@/store/projects-store";
import { fetchTaskNames, type TaskName } from "@/lib/api/task-names";
import { cn } from "@/lib/utils";
import { ListPlus, CaretDown } from "@phosphor-icons/react";

export function TimerInput() {
  const { taskDescription, setTaskDescription, selectedProjectId, setSelectedProjectId, isRunning } = useTimerStore();
  const { projects } = useProjectsStore();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskName[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [recentTasks, setRecentTasks] = useState<TaskName[]>([]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId]);

  useEffect(() => {
    fetchTaskNames({}).then(setRecentTasks).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (taskDescription.length > 0) {
        const results = await fetchTaskNames({ q: taskDescription, projectId: selectedProjectId || undefined });
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        const recent = await fetchTaskNames({});
        setSuggestions(recent);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [taskDescription, selectedProjectId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <div className="w-full max-w-3xl bg-base-900/80 backdrop-blur-xl border border-base-800 shadow-2xl rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all duration-300 relative z-20 group">
      <div className="flex-1 flex items-center w-full px-4 py-2 relative">
        <ListPlus size={20} className="text-base-400 mr-3 group-focus-within:text-brand-400 transition-colors flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onFocus={() => (suggestions.length > 0 || recentTasks.length > 0) && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="What are you working on?"
          disabled={isRunning}
          className="w-full bg-transparent border-none outline-none text-xl lg:text-2xl text-white placeholder-base-400/70 font-light disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {showSuggestions && (suggestions.length > 0 || recentTasks.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-base-900 border border-base-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            {(suggestions.length > 0 ? suggestions : recentTasks).map((s) => (
              <button
                key={s.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-800/50 transition-colors text-left"
                onMouseDown={() => {
                  setTaskDescription(s.name);
                  if (s.projectId) setSelectedProjectId(s.projectId);
                  setShowSuggestions(false);
                }}
              >
                {s.project && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.project.color }} />
                )}
                <span className="text-sm text-base-200">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-8 w-px bg-base-800 hidden sm:block" />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !isRunning && setShowProjectDropdown(!showProjectDropdown)}
          disabled={isRunning}
          className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-2 rounded-xl hover:bg-base-800/80 transition-colors border border-transparent hover:border-base-700 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: selectedProject?.color || "#10b981",
                boxShadow: `0 0 8px ${selectedProject?.color || "#10b981"}99`,
              }}
            />
            <span className="text-sm font-medium text-base-200">
              {selectedProject?.name || "Select project"}
            </span>
          </div>
          <CaretDown size={16} className="text-base-400" />
        </button>

        {showProjectDropdown && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-base-900 border border-base-800 rounded-xl shadow-2xl overflow-hidden z-50">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setShowProjectDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-base-800/50 transition-colors text-left",
                  project.id === selectedProjectId && "bg-base-800/30"
                )}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color, boxShadow: `0 0 8px ${project.color}99` }}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-base-200">{project.name}</span>
                  {project.client && <span className="text-xs text-base-500">{project.client}</span>}
                </div>
              </button>
            ))}
            {projects.length === 0 && (
              <div className="px-4 py-3 text-sm text-base-500">No projects yet</div>
            )}
          </div>
        )}
      </div>
    </div>

    {!isRunning && !taskDescription && recentTasks.length > 0 && (
      <div className="w-full max-w-3xl px-6 py-2 flex items-center gap-4 text-xs text-base-400 opacity-60">
        <span>Recent:</span>
        {recentTasks.slice(0, 3).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTaskDescription(t.name);
              if (t.projectId) setSelectedProjectId(t.projectId);
            }}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            {t.project && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.project.color }} />
            )}
            {t.name}
          </button>
        ))}
      </div>
    )}
  </>
  );
}
