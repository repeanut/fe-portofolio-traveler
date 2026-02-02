import React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type AdminAlertVariant = "success" | "info" | "warning" | "error";

export type AdminAlertProps = {
  variant: AdminAlertVariant;
  title: string;
  description?: string;
  onClose?: () => void;
};

const AdminAlert: React.FC<AdminAlertProps> = ({ variant, title, description, onClose }) => {
  const config: Record<AdminAlertVariant, { Icon: React.ElementType; cls: string; iconCls: string }> = {
    success: {
      Icon: CheckCircle2,
      cls: "border-emerald-200 bg-emerald-50/40",
      iconCls: "text-emerald-600",
    },
    info: {
      Icon: Info,
      cls: "border-sky-200 bg-sky-50/40",
      iconCls: "text-sky-600",
    },
    warning: {
      Icon: AlertTriangle,
      cls: "border-amber-200 bg-amber-50/40",
      iconCls: "text-amber-600",
    },
    error: {
      Icon: XCircle,
      cls: "border-rose-200 bg-rose-50/40",
      iconCls: "text-rose-600",
    },
  };

  const { Icon, cls, iconCls } = config[variant];

  return (
    <div className={`w-full max-w-md rounded-xl border ${cls} shadow-sm backdrop-blur`}
    >
      <div className="flex gap-3 px-4 py-3">
        <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 border border-white ${iconCls}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-semibold text-slate-900 truncate">{title}</p>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {description ? (
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminAlert;
