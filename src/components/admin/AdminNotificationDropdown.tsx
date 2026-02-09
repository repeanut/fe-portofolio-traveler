import React, { useEffect, useMemo, useState } from "react";
import { Bell, Package, MessageSquare, Clock } from "lucide-react";

type NotificationType = "order" | "chat" | "deadline";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const mockAdminNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New order received",
    description: "John Doe placed an order for SEO content writing",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "chat",
    title: "New chat message",
    description: "Sarah Wilson sent you a message about logo design",
    time: "5 min ago",
    read: false,
  },
  {
    id: "3",
    type: "deadline",
    title: "Deadline approaching",
    description: "Order ORD-20250121-001 deadline is tomorrow",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    type: "order",
    title: "Order completed",
    description: "Michael Chen's order has been marked as completed",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "chat",
    title: "New chat message",
    description: "Emma Johnson asked about video editing progress",
    time: "4 hours ago",
    read: true,
  },
];

const mockUserNotifications: Notification[] = [
  {
    id: "u1",
    type: "chat",
    title: "New message from admin",
    description: "You have a new message about your order details.",
    time: "Just now",
    read: false,
  },
  {
    id: "u2",
    type: "order",
    title: "Order in progress",
    description: "Your order is being processed.",
    time: "10 min ago",
    read: false,
  },
  {
    id: "u3",
    type: "order",
    title: "Order completed",
    description: "Your draft is ready. Please review the delivery.",
    time: "2 hours ago",
    read: true,
  },
];

const typeIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  order: Package,
  chat: MessageSquare,
  deadline: Clock,
};

const typeColors: Record<NotificationType, string> = {
  order: "text-blue-600 bg-blue-50",
  chat: "text-emerald-600 bg-emerald-50",
  deadline: "text-amber-600 bg-amber-50",
};

type AdminNotificationDropdownProps = {
  variant?: "admin" | "user";
  initialNotifications?: Notification[];
  buttonClassName?: string;
};

const AdminNotificationDropdown: React.FC<AdminNotificationDropdownProps> = ({
  variant = "admin",
  initialNotifications,
  buttonClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications ?? (variant === "user" ? mockUserNotifications : mockAdminNotifications)
  );
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [activeTab, notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          buttonClassName ??
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-700"
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-2 w-[320px] sm:w-[420px] max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    {variant === "user" ? "Updates for orders & messages" : "Keep track of orders & messages"}
                  </span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Mark all
                </button>
              )}
            </div>

            <div className="px-4 py-2 border-b border-slate-100">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors ${
                    activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors ${
                    activeTab === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Bell className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">You're all caught up</p>
                  <p className="mt-1 text-[11px] text-slate-500">No notifications to show</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredNotifications.map((notif) => {
                    const Icon = typeIcons[notif.type];
                    const colorClass = typeColors[notif.type];
                    return (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                          !notif.read ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 truncate">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {notif.description}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                              </div>
                              {!notif.read && (
                                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
