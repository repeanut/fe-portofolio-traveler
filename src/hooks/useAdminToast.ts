import { useContext } from "react";
import { AdminToastContext } from "../components/admin/AdminToastContext";

export const useAdminToast = () => {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
};
