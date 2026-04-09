"use client";

import { useState } from "react";
import { useEntriesStore } from "@/store/entries-store";
import { useTimerStore } from "@/store/timer-store";
import { formatDuration, formatTime, formatDate } from "@/lib/utils";
import type { TimeEntry } from "@/lib/api/time-entries";
import { PencilSimple, Trash, Play, ArrowRight, Clock } from "@phosphor-icons/react";

function EntryRow({ entry }: { entry: TimeEntry }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(entry.description);
  const { update, remove } = useEntriesStore();
  const { continueEntry } = useTimerStore();

  const handleSave = async () => {
    if (editValue.trim() && editValue !== entry.description) {
      await update(entry.id, { description: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await remove(entry.id);
  };

  const duration = entry.duration || 0;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-base-800/30 hover:bg-base-800/30 transition-colors relative gap-4 sm:gap-0">
      <div className="flex items-start sm:items-center gap-4 sm:gap-8 flex-1">
        <div className="text-sm text-base-500 font-mono w-auto sm:w-36 flex-shrink-0 flex items-center gap-2 group-hover:text-base-400 transition-colors">
          {formatTime(new Date(entry.startTime))}
          <ArrowRight size={12} />
          {entry.endTime ? formatTime(new Date(entry.endTime)) : "..."}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              className="w-full bg-base-950 border border-base-700 rounded px-2 py-1 text-base text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
          ) : (
            <span
              className="text-base text-base-200 truncate cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {entry.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-64 flex-shrink-0">
        <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-base-400 hover:text-white hover:bg-base-700 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilSimple size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-base-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash size={18} />
          </button>
        </div>

        <span className="text-lg font-mono font-medium text-base-300">{formatDuration(duration)}</span>

        <button
          onClick={async () => {
            await continueEntry(entry);
            const { useEntriesStore: getEntries } = await import("@/store/entries-store");
            getEntries.getState().loadToday();
          }}
          className="w-8 h-8 rounded-full border border-base-700 flex items-center justify-center text-base-400 hover:text-brand-400 hover:border-brand-400 hover:bg-brand-500/10 transition-all flex-shrink-0 bg-base-900"
          title="Continue Task"
        >
          <Play size={14} weight="fill" />
        </button>
      </div>
    </div>
  );
}

export function TimeEntryList() {
  const { entries, loading } = useEntriesStore();

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <div className="flex items-end justify-between px-2">
          <div><div className="skeleton h-7 w-24 mb-2" /><div className="skeleton h-4 w-40" /></div>
          <div className="text-right"><div className="skeleton h-4 w-28 mb-2" /><div className="skeleton h-6 w-20 ml-auto" /></div>
        </div>
        <div className="flex flex-col">
          <div className="py-3 px-4 bg-base-900/40 border-y border-base-800/50"><div className="skeleton h-5 w-40" /></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-base-800/30">
              <div className="flex items-center gap-8 flex-1"><div className="skeleton h-4 w-36" /><div className="skeleton h-4 w-48" /></div>
              <div className="skeleton h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Clock size={64} className="text-base-700" />
        <p className="text-base-500 text-lg">No entries today</p>
        <p className="text-base-600 text-sm">Start tracking to see your work here</p>
      </div>
    );
  }

  const grouped: Record<string, { project: TimeEntry["project"]; entries: TimeEntry[]; total: number }> = {};
  entries.filter(e => e.duration !== null).forEach((entry) => {
    if (!grouped[entry.projectId]) {
      grouped[entry.projectId] = { project: entry.project, entries: [], total: 0 };
    }
    grouped[entry.projectId].entries.push(entry);
    grouped[entry.projectId].total += entry.duration || 0;
  });

  const totalSeconds = entries.reduce((acc, e) => acc + (e.duration || 0), 0);

  return (
    <section className="w-full max-w-4xl flex flex-col gap-8 pb-24">
      <header className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Today</h2>
          <p className="text-sm text-base-400 mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-base-400 mb-1">Total Tracked</p>
          <p className="text-xl font-mono font-medium text-white">{formatDuration(totalSeconds)}</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([projectId, group]) => (
          <div key={projectId} className="flex flex-col">
            <div className="flex items-center justify-between py-3 px-4 bg-base-900/40 border-y border-base-800/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: group.project.color,
                    boxShadow: `0 0 8px ${group.project.color}80`,
                  }}
                />
                <h3 className="font-medium text-base-200">{group.project.name}</h3>
                {group.project.client && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-base-800 text-base-400 border border-base-700">
                    {group.project.client}
                  </span>
                )}
              </div>
              <span className="text-sm font-mono font-medium text-base-400">{formatDuration(group.total)}</span>
            </div>

            {group.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
