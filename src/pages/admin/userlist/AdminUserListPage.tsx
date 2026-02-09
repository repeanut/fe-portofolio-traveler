import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";

interface UserItem extends Record<string, unknown> {
  id: number;
  username: string;
  email: string;
  role: string;
  displayName?: string;
  provider?: string;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

const AdminUserListPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("users");
  const [userData, setUserData] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users");
      const result = (await response.json()) as unknown;

      if (typeof result !== "object" || result == null) {
        setError("Failed to fetch users");
        return;
      }

      const payload = result as {
        success?: boolean;
        message?: string;
        data?: { users?: Record<string, unknown>[] };
      };

      if (payload.success) {
        const rawUsers = payload.data?.users ?? [];
        const mapped = rawUsers.map((user) => {
          const idRaw = user.id;
          const id = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number(idRaw);
          return {
            ...(user as unknown as UserItem),
            id: Number.isFinite(id) ? id : 0,
          };
        });

        setUserData(mapped);
        setError(null);
      } else {
        setError(payload.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error connecting to backend API");
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const columns: Column[] = [
    { header: "Username", accessor: "username", type: "text" },
    { header: "Email", accessor: "email", type: "text" },
    { header: "Display Name", accessor: "displayName", type: "text" },
    { header: "Role", accessor: "role", type: "text" },
    { header: "Provider", accessor: "provider", type: "text" },
    { header: "Email Verified", accessor: "isEmailVerified", type: "text" },
    { header: "Last Login", accessor: "lastLogin", type: "text" },
    { header: "Created", accessor: "createdAt", type: "text" },
  ];

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchUsers();
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
      console.error('Error deleting user:', err);
    }
  };

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-28" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
          onNavigate={(key) => {
            setActiveMenu(key);
            if (key === "dashboard") {
              navigate("/admin/dashboard");
            } else if (key === "chat") {
              navigate("/admin/chat");
            } else if (key === "landing") {
              navigate("/admin/landing/hero");
            } else if (key === "users") {
              navigate("/admin/users");
            } else if (key === "shop") {
              navigate("/admin/shop");
            } else if (key === "transactions") {
              navigate("/admin/transactions");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
          onNavigateLandingSub={(subKey) => {
            setActiveMenu("landing");
            if (subKey === "hero") {
              navigate("/admin/landing/hero");
            } else if (subKey === "travel") {
              navigate("/admin/landing/travel-journal");
            } else if (subKey === "about") {
              navigate("/admin/landing/about");
            } else if (subKey === "portfolio") {
              navigate("/admin/landing/portfolio");
            } else if (subKey === "certServices") {
              navigate("/admin/landing/cert-services");
            } else if (subKey === "experience") {
              navigate("/admin/landing/experience");
            } else if (subKey === "faq") {
              navigate("/admin/landing/faq");
            }
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
          <AdminHeader title="User List" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search user..."
                addLabel=""
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTable
                columns={columns}
                data={userData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onDelete={(id?: number) => id && handleDeleteUser(id)}
              />
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminUserListPage;
