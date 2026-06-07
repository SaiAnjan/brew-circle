"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "warning";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type Toast = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "default", durationMs = 4500 }: ToastInput) => {
      const id = createToastId();
      setToasts((currentToasts) => [
        ...currentToasts.slice(-3),
        { id, title, description, variant },
      ]);

      if (durationMs > 0) {
        window.setTimeout(() => dismissToast(id), durationMs);
      }
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-2xl border bg-card p-4 text-sm shadow-lg",
              toast.variant === "success" && "border-emerald-500/30",
              toast.variant === "error" && "border-red-500/30",
              toast.variant === "warning" && "border-accent/40",
              toast.variant === "default" && "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-primary">{toast.title}</p>
                {toast.description && <p className="mt-1 leading-relaxed text-muted">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-muted hover:bg-background hover:text-primary"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
