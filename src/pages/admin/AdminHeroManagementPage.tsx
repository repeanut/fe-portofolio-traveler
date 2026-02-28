import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminTableHeader from "../../components/admin/AdminTableHeader";
import AdminTable from "../../components/admin/AdminTable";
import type { Column } from "../../components/admin/AdminTable";
import AdminModal, {
  type AdminModalField,
} from "../../components/admin/AdminModal";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../components/ui/skeletons";

interface HeroContent extends Record<string, unknown> {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  section: string;
}

const AdminHeroManagementPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [heroData, setHeroData] = useState<HeroContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const columns: Column[] = [
    { header: "Title", accessor: "title", type: "text" },
    { header: "Subtitle", accessor: "subtitle", type: "textarea" },
    { header: "Content", accessor: "content", type: "textarea" },
    { header: "Image", accessor: "imageUrl", type: "image" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: true,
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "textarea",
        required: false,
      },
      {
        name: "content",
        label: "Content",
        type: "textarea",
        required: false,
      },
      {
        name: "imageUrl",
        label: "Hero Image",
        type: "image",
        multiple: false,
      },
    ],
    []
  );

  const fetchHeroData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/landing-pages/section/hero');
      const result = await response.json();
      
      if (result.success) {
        setHeroData(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching hero data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const payload = {
        ...data,
        section: "hero",
      };

      if (editingId) {
        // Update existing hero
        const response = await fetch(`http://localhost:5000/api/landing-pages/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          await fetchHeroData();
          setIsModalOpen(false);
          setEditingId(null);
        } else {
          setError(result.message || "Failed to update hero");
        }
      } else {
        // Create new hero
        const response = await fetch("http://localhost:5000/api/landing-pages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          await fetchHeroData();
          setIsModalOpen(false);
        } else {
          setError(result.message || "Failed to create hero");
        }
      }
    } catch (err) {
      setError("Error saving hero data");
      console.error("Error saving hero:", err);
    }
  };

  const handleEdit = (id: number) => {
    const hero = heroData.find((item) => item.id === id);
    if (hero) {
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero section?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/landing-pages/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchHeroData();
      }
    } catch (err) {
      console.error('Error deleting hero:', err);
    }
  };

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-44" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="hero"
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
            } else if (key === "transactions") {
              navigate("/admin/transactions");
            } else if (key === "blog") {
              navigate("/admin/blog");
            }
          }}
          onNavigateLandingSub={(subKey) => {
            if (subKey === "hero") {
              setActiveMenu("landing");
              navigate("/admin/landing/hero");
            } else if (subKey === "travel") {
              setActiveMenu("landing");
              navigate("/admin/landing/travel-journal");
            } else if (subKey === "about") {
              setActiveMenu("landing");
              navigate("/admin/landing/about");
            } else if (subKey === "portfolio") {
              setActiveMenu("landing");
              navigate("/admin/landing/portfolio");
            } else if (subKey === "certServices") {
              setActiveMenu("landing");
              navigate("/admin/landing/cert-services");
            } else if (subKey === "experience") {
              setActiveMenu("landing");
              navigate("/admin/landing/experience");
            } else if (subKey === "faq") {
              setActiveMenu("landing");
              navigate("/admin/landing/faq");
            }
          }}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Hero Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            {/* Top: Hero text management */}
            <section>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <AdminTableHeader
                onAddClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              {/* Table */}
              <AdminTable
                columns={columns}
                data={heroData}
                isLoading={isLoading}
                onDelete={(id) => id && handleDelete(id)}
                onEdit={(id) => id && handleEdit(id)}
              />
            </section>
          </div>
        </div>

        {/* Hero modal */}
        <AdminModal
          isOpen={isModalOpen}
          title={editingId ? "Edit Hero" : "Tambah Hero"}
          fields={modalFields}
          initialData={
            editingId != null
              ? (heroData.find((item) => item.id === editingId) as
                  | Record<string, unknown>
                  | undefined)
              : undefined
          }
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
          onSubmit={(data) => handleSave(data)}
        />
      </div>
    </InitialShimmer>
  );
};

export default AdminHeroManagementPage;
