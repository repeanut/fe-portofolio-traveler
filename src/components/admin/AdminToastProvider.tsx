import React, { useCallback, useMemo, useRef, useState } from "react";
import AdminAlert from "./AdminAlert";
import { AdminToastContext, type ToastInput, type AdminToastApi } from "./AdminToastContext";

type ToastItem = ToastInput & { id: number; createdAt: number };

type AdminToastProviderProps = {
  children: React.ReactNode;
};

const DEFAULT_DURATION = 3200;

const AdminToastProvider: React.FC<AdminToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = idRef.current++;
      const item: ToastItem = {
        id,
        createdAt: Date.now(),
        durationMs: toast.durationMs ?? DEFAULT_DURATION,
        ...toast,
      };

      setToasts((prev) => {
        const next = [item, ...prev];
        return next.slice(0, 4);
      });

      const duration = item.durationMs ?? DEFAULT_DURATION;
      if (duration > 0) {
        window.setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const api = useMemo<AdminToastApi>(
    () => ({
      show,
      success: (title, description, durationMs) =>
        show({ variant: "success", title, description, durationMs }),
      info: (title, description, durationMs) =>
        show({ variant: "info", title, description, durationMs }),
      warning: (title, description, durationMs) =>
        show({ variant: "warning", title, description, durationMs }),
      error: (title, description, durationMs) =>
        show({ variant: "error", title, description, durationMs }),
    }),
    [show]
  );

  return (
    <AdminToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1200] flex w-full max-w-md flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <AdminAlert
              variant={t.variant}
              title={t.title}
              description={t.description}
              onClose={() => remove(t.id)}
            />
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
};

export default AdminToastProvider;
