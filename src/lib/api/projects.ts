export interface Project {
  id: string;
  name: string;
  color: string;
  client: string | null;
  createdAt: string;
  updatedAt: string;
  totalSeconds: number;
  entryCount: number;
}

const BASE = "/api/projects";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(data: { name: string; color: string; client?: string }): Promise<Project> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProject(id: string, data: Partial<{ name: string; color: string; client: string }>): Promise<Project> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}
