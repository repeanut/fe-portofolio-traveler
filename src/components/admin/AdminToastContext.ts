import { createContext } from "react";
import type { AdminAlertVariant } from "./AdminAlert";

type ToastInput = {
  variant: AdminAlertVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

type AdminToastApi = {
  show: (toast: ToastInput) => void;
  success: (title: string, description?: string, durationMs?: number) => void;
  info: (title: string, description?: string, durationMs?: number) => void;
  warning: (title: string, description?: string, durationMs?: number) => void;
  error: (title: string, description?: string, durationMs?: number) => void;
};

export const AdminToastContext = createContext<AdminToastApi | null>(null);

export type { ToastInput, AdminToastApi };
