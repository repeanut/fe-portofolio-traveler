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
import { useAdminToast } from "../../hooks/useAdminToast";

interface ExperienceItem extends Record<string, unknown> {
  id: number;
  logo: string;
  logoAlt: string;
  title: string;
  company: string;
  period: string;
  duration: string;
}

const AdminExperiencePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [experienceData, setExperienceData] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/experiences");
      const result = await response.json();

      if (result.success) {
        setExperienceData(result.data.experiences);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch experiences");
      }
    } catch (err) {
      setError("Error connecting to backend API");
      console.error("Error fetching experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const columns: Column[] = [
    { header: "Logo", accessor: "logo", type: "image" },
    { header: "Position", accessor: "title", type: "text" },
    {
      header: "Date",
      accessor: "period",
      type: "text",
      render: (_, row) => {
        const period = (row.period as string) ?? "";
        const duration = (row.duration as string) ?? "";
        return (
          <span>{period && duration ? `${period} · ${duration}` : period || duration}</span>
        );
      },
    },
    { header: "Company", accessor: "company", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "logo",
        label: "Company Logo",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Position / Title",
        type: "text",
        placeholder: "e.g. Ads Quality Rater",
      },
      {
        name: "startDate",
        label: "Start date*",
        type: "monthYear",
      },
      {
        name: "endDate",
        label: "End date*",
        type: "monthYear",
      },
      {
        name: "duration",
        label: "Duration",
        type: "text",
        placeholder: "e.g. 2 yrs 3 mos",
      },
      {
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Company name",
      },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="experience"
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

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
        <AdminHeader title="Experience Management" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          <section>
            <AdminTableHeader
              onAddClick={() => {
                setEditingId(null);
                setIsModalOpen(true);
              }}
            />

{error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <AdminTable
                columns={columns}
                data={experienceData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingId(id);
                    setIsModalOpen(true);
                  }
                }}
                onDelete={async (id) => {
                  if (typeof id === "number") {
                    try {
                      const response = await fetch(`/api/experiences/${id}`, {
                        method: 'DELETE'
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                        await fetchExperiences();
                        toast.success("Berhasil", "Experience berhasil dihapus");
                      } else {
                        toast.error("Gagal", result.message || "Experience gagal dihapus");
                      }
                    } catch {
                      toast.error("Gagal", "Experience gagal dihapus");
                    }
                  }
                }}
              />
            )}
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Experience" : "Add Experience"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (experienceData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (data) => {
          const logoList = (data.logo as string[] | undefined) ?? [];
          const logo = logoList[0] || "";
          const title = (data.title as string) || "";
          const startDate = (data.startDate as string) || "";
          const endDate = (data.endDate as string) || "";
          const period =
            startDate && endDate
              ? `${startDate} to ${endDate}`
              : startDate || endDate;
          const duration = (data.duration as string) || "";
          const company = (data.company as string) || "";

          try {
            let response;
            
            if (editingId != null) {
              response = await fetch(`/api/experiences/${editingId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  logo,
                  logoAlt: "",
                  title,
                  company,
                  period,
                  duration
                })
              });
            } else {
              response = await fetch('/api/experiences', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  logo,
                  logoAlt: "",
                  title,
                  company,
                  period,
                  duration
                })
              });
            }
            
            const result = await response.json();
            
            if (result.success) {
              await fetchExperiences();
              toast.success("Berhasil", editingId ? "Experience berhasil diperbarui" : "Experience berhasil ditambahkan");
              setIsModalOpen(false);
              setEditingId(null);
            } else {
              toast.error("Gagal", result.message || "Perubahan experience gagal disimpan");
            }
          } catch {
            toast.error("Error", "Failed to save experience changes");
          }
        }}
      />
    </div>
  );
};

export default AdminExperiencePage;
