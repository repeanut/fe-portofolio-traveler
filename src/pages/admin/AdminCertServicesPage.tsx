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

interface CertificationItem extends Record<string, unknown> {
  id: number;
  logo: string;
  title: string;
  subtitle?: string;
  organization: string;
}

interface ServiceItem extends Record<string, unknown> {
  id: number;
  name: string;
}

const AdminCertServicesPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [certData, setCertData] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [servicesData, setServicesData] = useState<ServiceItem[]>([
    { id: 1, name: "Video Script" },
    { id: 2, name: "Custom Copywriting" },
    { id: 3, name: "Brand Storytelling" },
  ]);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const certColumns: Column[] = [
    { header: "Logo", accessor: "logo", type: "image" },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Subtitle", accessor: "subtitle", type: "text" },
    { header: "Organization", accessor: "organization", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const serviceColumns: Column[] = [
    { header: "Service", accessor: "name", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const certFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "logo",
        label: "Certification Logo",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Enter certification title...",
      },
      {
        name: "subtitle",
        label: "Subtitle (optional)",
        type: "text",
        placeholder: "Level or additional details...",
      },
      {
        name: "organization",
        label: "Organization / Company",
        type: "text",
        placeholder: "Organization / company name...",
      },
    ],
    []
  );

  const serviceFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Service",
        type: "text",
        placeholder: "Enter service name...",
      },
    ],
    []
  );

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchCertifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications`);
      const result = await response.json();
      
      if (result.success) {
        setCertData(result.data.certifications);
      } else {
        console.error('Failed to fetch certifications:', result.message);
        toast.error('Gagal', 'Gagal memuat data certifications');
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast.error('Gagal', 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleCertSubmit = async (data: Record<string, unknown>, editingId: number | null) => {
    const logoList = (data.logo as string[] | undefined) ?? [];
    const logo = logoList[0] || "";
    const title = (data.title as string) || "";
    const subtitle = (data.subtitle as string) || "";
    const organization = (data.organization as string) || "";

    try {
      let response;
      
      if (editingId != null) {
        response = await fetch(`${API_BASE_URL}/certifications/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logo, title, subtitle, organization }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logo, title, subtitle, organization }),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchCertifications();
        toast.success(
          "Berhasil",
          editingId != null ? "Certification berhasil diperbarui" : "Certification berhasil ditambahkan"
        );
        return true;
      } else {
        toast.error("Gagal", result.message || "Perubahan certification gagal disimpan");
        return false;
      }
    } catch (error) {
      console.error('Error saving certification:', error);
      toast.error("Gagal", "Terjadi kesalahan saat menyimpan data");
      return false;
    }
  };

  const handleCertDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/certifications/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCertifications();
        toast.success("Berhasil", "Certification berhasil dihapus");
        return true;
      } else {
        toast.error("Gagal", result.message || "Certification gagal dihapus");
        return false;
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast.error("Gagal", "Terjadi kesalahan saat menghapus data");
              return false;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="certServices"
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
        <AdminHeader title="Certifications Management" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          {/* Certifications table */}
          <section>

            <AdminTableHeader
              onAddClick={() => {
                setEditingCertId(null);
                setIsCertModalOpen(true);
              }}
            />

            <AdminTable
              columns={certColumns}
              data={certData}
              isLoading={loading}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingCertId(id);
                  setIsCertModalOpen(true);
                }
              }}
              onDelete={async (id) => {
                if (typeof id === "number") {
                  try {
                    setCertData((prev) => prev.filter((item) => item.id !== id));
                    toast.success("Success", "Certification deleted successfully");
                  } catch {
                    toast.error("Error", "Failed to delete certification");
                  }
                  await handleCertDelete(id);
                }
              }}
            />
          </section>

          {/* Services table */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Services Management</h2>
            </div>

            <AdminTableHeader
              onAddClick={() => {
                setEditingServiceId(null);
                setIsServiceModalOpen(true);
              }}
            />

            <AdminTable
              columns={serviceColumns}
              data={servicesData}
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingServiceId(id);
                  setIsServiceModalOpen(true);
                }
              }}
              onDelete={(id) => {
                if (typeof id === "number") {
                  try {
                    setServicesData((prev) => prev.filter((item) => item.id !== id));
                    toast.success("Success", "Service deleted successfully");
                  } catch {
                    toast.error("Error", "Failed to delete service");
                  }
                }
              }}
            />
          </section>
        </div>
      </div>

      {/* Certification modal */}
      <AdminModal
        isOpen={isCertModalOpen}
        title={editingCertId ? "Edit Certification" : "Add Certification"}
        fields={certFields}
        initialData={
          editingCertId != null
            ? (certData.find((item) => item.id === editingCertId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsCertModalOpen(false);
          setEditingCertId(null);
        }}
        onSubmit={async (data) => {
          const success = await handleCertSubmit(data, editingCertId);
          
          if (success) {
            setIsCertModalOpen(false);
            setEditingCertId(null);
          }
        }}
      />

      {/* Service modal */}
      <AdminModal
        isOpen={isServiceModalOpen}
        title={editingServiceId ? "Edit Service" : "Add Service"}
        fields={serviceFields}
        initialData={
          editingServiceId != null
            ? (servicesData.find((item) => item.id === editingServiceId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingServiceId(null);
        }}
        onSubmit={(data) => {
          const name = (data.name as string) || "";

          try {
            if (editingServiceId != null) {
              setServicesData((prev) =>
                prev.map((item) =>
                  item.id === editingServiceId
                    ? {
                        ...item,
                        name: name || item.name,
                      }
                    : item
                )
              );
              toast.success("Success", "Service updated successfully");
            } else {
              setServicesData((prev) => {
                const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    name,
                  },
                ];
              });
              toast.success("Success", "Service added successfully");
            }

            setIsServiceModalOpen(false);
            setEditingServiceId(null);
          } catch {
            toast.error("Error", "Failed to save service changes");
          }
        }}
      />
    </div>
  );
};

export default AdminCertServicesPage;
