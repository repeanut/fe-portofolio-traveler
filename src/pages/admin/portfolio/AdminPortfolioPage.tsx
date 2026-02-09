import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";

interface PortfolioItem extends Record<string, unknown> {
  id: number;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  tags?: string[];
  featured: boolean;
  published: boolean;
  orderIndex: number;
  clientName?: string;
  completionDate?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPortfolioPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/portfolios?includeUser=true");
      const result = (await response.json()) as unknown;

      if (typeof result !== "object" || result == null) {
        setError("Failed to fetch portfolios");
        return;
      }

      const payload = result as {
        success?: boolean;
        message?: string;
        data?: { portfolios?: Record<string, unknown>[] };
      };

      if (payload.success) {
        const raw = payload.data?.portfolios ?? [];
        const mapped = raw.map((portfolio) => {
          const idRaw = portfolio.id;
          const id = typeof idRaw === "string" ? Number.parseInt(idRaw, 10) : Number(idRaw);
          return {
            ...(portfolio as unknown as PortfolioItem),
            id: Number.isFinite(id) ? id : 0,
          };
        });
        setPortfolioData(mapped);
        setError(null);
      } else {
        setError(payload.message || "Failed to fetch portfolios");
      }
    } catch (err) {
      setError("Error connecting to backend API");
      console.error("Error fetching portfolios:", err);
    }
  };

  // Fetch portfolios from backend API
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPortfolios();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const columns: Column[] = [
    { header: "Title", accessor: "title", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Client", accessor: "clientName", type: "text" },
    { header: "Featured", accessor: "featured", type: "text" },
    { header: "Published", accessor: "published", type: "text" },
    { header: "Order", accessor: "orderIndex", type: "number" },
    { header: "Created", accessor: "createdAt", type: "text" },
  ];

  const handleDeletePortfolio = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/portfolios/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchPortfolios(); // Refresh the list
      } else {
        setError(result.message || 'Failed to delete portfolio');
      }
    } catch (err) {
      setError('Error deleting portfolio');
      console.error('Error deleting portfolio:', err);
    }
  };

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-32" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="portfolio"
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
          <AdminHeader title="Portfolio Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search portfolio..."
                addLabel=""
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTable
                columns={columns}
                data={portfolioData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onDelete={(id?: number) => id && handleDeletePortfolio(id)}
              />
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminPortfolioPage;
