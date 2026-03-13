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

interface LandingPageItem extends Record<string, unknown> {
  id: number;
  section: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  orderIndex: number;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminLandingPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [landingData, setLandingData] = useState<LandingPageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLandingPages = async () => {
    try {
      const response = await fetch("http://localhost:55435/api/landing-page/landing-pages?includeUser=true");
      const result = (await response.json()) as unknown;

      if (typeof result !== "object" || result == null) {
        setError("Failed to fetch landing pages");
        return;
      }

      const payload = result as {
        success?: boolean;
        message?: string;
        data?: { pages?: Record<string, unknown>[] };
      };

      if (payload.success) {
        const raw = payload.data?.pages ?? [];
        setLandingData(
          raw.map((page) => {
            const idRaw = page.id;
            const id = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number(idRaw);
            return {
              ...(page as unknown as LandingPageItem),
              id: Number.isFinite(id) ? id : 0,
            };
          })
        );
        setError(null);
      } else {
        setError(payload.message || "Failed to fetch landing pages");
      }
    } catch (err) {
      setError("Error connecting to backend API");
      console.error("Error fetching landing pages:", err);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLandingPages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const columns: Column[] = [
    { header: "Section", accessor: "section", type: "text" },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Subtitle", accessor: "subtitle", type: "text" },
    { header: "Button Text", accessor: "buttonText", type: "text" },
    { header: "Order", accessor: "orderIndex", type: "number" },
    { header: "Active", accessor: "isActive", type: "text" },
    { header: "Created", accessor: "createdAt", type: "text" },
  ];

  const handleDeleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:55435/api/landing-page/landing-pages/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchLandingPages(); // Refresh the list
      } else {
        setError(result.message || 'Failed to delete landing page');
      }
    } catch (err) {
      setError('Error deleting landing page');
      console.error('Error deleting landing page:', err);
    }
  };

  const handleCreateLandingPage = async (newItem: Partial<LandingPageItem>) => {
    try {
      const response = await fetch('http://localhost:55435/api/landing-page/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchLandingPages(); // Refresh the list
        return true;
      } else {
        setError(result.message || 'Failed to create landing page');
        return false;
      }
    } catch (err) {
      setError('Error creating landing page');
      console.error('Error creating landing page:', err);
      return false;
    }
  };

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-32" rows={6} />}>
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
          <AdminHeader title="Landing Page Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search landing page..."
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTable
                columns={columns}
                data={landingData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onDelete={(id?: string) => id && handleDeleteLandingPage(id)}
                onEdit={(id?: string) => id && console.log('Edit item:', id)}
                onCreate={() => {
                  // Default item creation
                  const newItem = {
                    section: 'Destination',
                    title: 'New Destination',
                    subtitle: 'Description for new destination',
                    orderIndex: landingData.length + 1,
                    isActive: true,
                    createdBy: 'admin'
                  };
                  handleCreateLandingPage(newItem);
                }}
              />
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminLandingPage;
