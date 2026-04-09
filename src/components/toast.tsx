"use client";

import { useEffect, useState, useCallback } from "react";
import { create } from "zustand";
import { WarningCircle, CheckCircle, X } from "@phosphor-icons/react";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success";
}

interface ToastState {
  toasts: Toast[];
  add: (message: string, type?: "error" | "success") => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (message, type = "error") => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().remove(id), 5000);
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => remove(toast.id), 300);
  }, [remove, toast.id]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${
        toast.type === "error"
          ? "bg-danger-500/10 border-danger-500/30 text-danger-400"
          : "bg-brand-500/10 border-brand-500/30 text-brand-400"
      }`}
    >
      {toast.type === "error" ? (
        <WarningCircle size={18} weight="fill" className="flex-shrink-0" />
      ) : (
        <CheckCircle size={18} weight="fill" className="flex-shrink-0" />
      )}
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={handleClose} className="p-0.5 hover:opacity-70 transition-opacity flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
