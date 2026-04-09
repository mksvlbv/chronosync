"use client";

import { useEffect, useState } from "react";
import { useProjectsStore } from "@/store/projects-store";
import { formatDurationShort, PROJECT_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus, X, PencilSimple, Trash, FolderDashed } from "@phosphor-icons/react";

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
            <X size={20} />
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
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-base-900/40 border border-base-800/80 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="skeleton w-4 h-4 rounded-full" />
                <div className="skeleton h-5 w-40" />
              </div>
              <div className="skeleton h-5 w-20" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-base-800/50 flex items-center justify-center">
            <FolderDashed size={32} className="text-base-400" />
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
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center justify-between p-4 bg-base-900/40 border border-base-800/80 rounded-xl hover:bg-base-800/40 hover:border-base-700 transition-all relative"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color, boxShadow: `0 0 8px ${project.color}80` }}
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-lg text-base-200">{project.name}</h3>
                    {project.client && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-base-800 text-base-400 border border-base-700">
                        {project.client}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-base-400 mb-0.5">Total Tracked</p>
                  <p className="font-mono text-base-200 font-medium">{formatDurationShort(project.totalSeconds)}</p>
                </div>
                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                  <button
                    onClick={() => { setEditProject(project); setModalOpen(true); }}
                    className="p-2 text-base-400 hover:text-white hover:bg-base-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSimple size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="p-2 text-base-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              {deleteConfirm === project.id && (
                <div className="absolute inset-0 bg-base-900/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-4 p-6 z-10">
                  <p className="text-white font-medium">Delete &quot;{project.name}&quot;?</p>
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-base-300 hover:bg-base-800 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="px-4 py-2 text-sm text-white bg-danger-500 hover:bg-danger-400 rounded-lg transition-colors">
                    Delete
                  </button>
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
