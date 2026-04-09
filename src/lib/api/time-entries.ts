import type { Project } from "./projects";

export interface TimeEntry {
  id: string;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  projectId: string;
  project: Project;
  createdAt: string;
  updatedAt: string;
}

const BASE = "/api/time-entries";

export async function fetchTimeEntries(params?: { date?: string; from?: string; to?: string }): Promise<TimeEntry[]> {
  const search = new URLSearchParams();
  if (params?.date) search.set("date", params.date);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const res = await fetch(`${BASE}?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch time entries");
  return res.json();
}

export async function createTimeEntry(data: {
  description: string;
  projectId: string;
  startTime?: string;
  endTime?: string;
}): Promise<TimeEntry> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create time entry");
  return res.json();
}

export async function updateTimeEntry(id: string, data: Partial<{
  description: string;
  projectId: string;
  startTime: string;
  endTime: string;
}>): Promise<TimeEntry> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update time entry");
  return res.json();
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete time entry");
}

export async function stopTimeEntry(id: string): Promise<TimeEntry> {
  const res = await fetch(`${BASE}/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to stop time entry");
  return res.json();
}
