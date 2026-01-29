import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";

interface UserItem extends Record<string, unknown> {
  id: number;
  username: string;
  email: string;
  role: string;
}

const AdminUserListPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("users");
  const navigate = useNavigate();

  const [userData] = useState<UserItem[]>([
    { id: 1, username: "rizqi", email: "rizqi@example.com", role: "user" },
    { id: 2, username: "revina", email: "revina@example.com", role: "user" },
    { id: 3, username: "johndoe", email: "john.doe@example.com", role: "user" },
  ]);

  const columns: Column[] = [
    { header: "Username", accessor: "username", type: "text" },
    { header: "Email", accessor: "email", type: "text" },
    { header: "Role", accessor: "role", type: "text" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "landing") {
            navigate("/admin/landing/hero");
          } else if (key === "users") {
            navigate("/admin/users");
          } else if (key === "shop") {
            navigate("/admin/shop");
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

      <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
        <AdminHeader title="User List" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          <section>
            <AdminTableHeader
              placeholder="Search user..."
              addLabel=""
            />
            <AdminTable
              columns={columns}
              data={userData}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminUserListPage;
