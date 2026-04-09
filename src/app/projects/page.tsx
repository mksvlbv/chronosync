"use client";

import { useEffect, useState } from "react";
import { useProjectsStore } from "@/store/projects-store";
import { formatDurationShort, PROJECT_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";

function ProjectModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; color: string; client: string | null };
  onSave: (data: { name: string; color: string; client?: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || "#10b981");
  const [client, setClient] = useState(initial?.client || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setColor(initial?.color || "#10b981");
      setClient(initial?.client || "");
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), color, client: client.trim() || undefined });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-base-900 border border-base-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-800">
          <h2 className="text-lg font-semibold text-white">
            {initial ? "Edit Project" : "Add New Project"}
          </h2>
          <button onClick={onClose} className="text-base-400 hover:text-white transition-colors p-1 rounded-md hover:bg-base-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-base-400">
              Project Name <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-base-950 border border-base-700 rounded-lg px-4 py-2.5 text-white placeholder-base-400/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-base-400">
              Client / Tag <span className="text-base-500 text-xs ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Acme Corp"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-base-950 border border-base-700 rounded-lg px-4 py-2.5 text-white placeholder-base-400/50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-base-400">Project Color</label>
            <div className="flex items-center gap-3">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full hover:scale-110 transition-transform focus:outline-none ring-2 ring-offset-2 ring-offset-base-900",
                    color === c ? "ring-white" : "ring-transparent"
                  )}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 10px ${c}80` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-base-900/50 border-t border-base-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-base-300 hover:text-white hover:bg-base-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-400 rounded-lg transition-colors shadow-lg disabled:opacity-50"
            style={{ boxShadow: "0 4px 14px rgb(16 185 129 / 0.2)" }}
          >
            {saving ? "Saving..." : initial ? "Update Project" : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, loading, load, add, update, remove } = useProjectsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<{ id: string; name: string; color: string; client: string | null } | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (data: { name: string; color: string; client?: string }) => {
    await add(data);
  };

  const handleEdit = async (data: { name: string; color: string; client?: string }) => {
    if (editProject) {
      await update(editProject.id, data);
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Projects</h1>
        <button
          onClick={() => { setEditProject(undefined); setModalOpen(true); }}
          className="bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
          style={{ boxShadow: "0 4px 14px rgb(16 185 129 / 0.2)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-2 border-base-700 border-t-brand-500 rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-base-900 border border-base-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-base-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No projects yet</h3>
          <p className="text-base-400 text-center max-w-sm">
            Create your first project to start organizing your tracked time and generating detailed reports.
          </p>
          <button
            onClick={() => { setEditProject(undefined); setModalOpen(true); }}
            className="mt-2 bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-base-900/60 border border-base-800 rounded-2xl p-6 hover:border-base-700 transition-all group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}60` }}
                  />
                  <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditProject(project); setModalOpen(true); }}
                    className="p-1.5 text-base-400 hover:text-white hover:bg-base-800 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="p-1.5 text-base-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {project.client && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-base-800 text-base-400 border border-base-700 mb-3 inline-block">
                  {project.client}
                </span>
              )}
              <div className="mt-4 pt-4 border-t border-base-800/50">
                <p className="text-sm text-base-400">Total Tracked</p>
                <p className="text-xl font-mono font-medium text-white mt-1">
                  {formatDurationShort(project.totalSeconds)}
                </p>
              </div>

              {deleteConfirm === project.id && (
                <div className="absolute inset-0 bg-base-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 p-6">
                  <p className="text-white font-medium text-center">Delete &quot;{project.name}&quot;?</p>
                  <p className="text-base-400 text-sm text-center">All time entries will be deleted.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-base-300 hover:bg-base-800 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="px-4 py-2 text-sm text-white bg-danger-500 hover:bg-danger-400 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProject(undefined); }}
        initial={editProject || undefined}
        onSave={editProject ? handleEdit : handleAdd}
      />
    </div>
  );
}
