export interface TaskName {
  id: string;
  name: string;
  projectId: string | null;
  usageCount: number;
  lastUsedAt: string;
  project: { id: string; name: string; color: string } | null;
}

export async function fetchTaskNames(params?: { q?: string; projectId?: string }): Promise<TaskName[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.projectId) search.set("projectId", params.projectId);
  const res = await fetch(`/api/task-names?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch task names");
  return res.json();
}
