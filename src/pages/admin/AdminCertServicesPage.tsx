import React, { useEffect, useMemo, useState } from "react";
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

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:55435";

  const [loadingCerts, setLoadingCerts] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [certData, setCertData] = useState<CertificationItem[]>([]);

  const [servicesData, setServicesData] = useState<ServiceItem[]>([]);

  const fetchCerts = async () => {
    try {
      setLoadingCerts(true);
      const response = await fetch(`${API_BASE}/api/landing-page/certifications`, {
        credentials: "include",
      });
      const json = (await response.json().catch(() => null)) as any;
      if (!response.ok || !json?.success) throw new Error(json?.message || "Failed to fetch certifications");
      const items = (Array.isArray(json.data) ? json.data : []) as any[];
      setCertData(
        items.map((x) => ({
          id: Number(x.id),
          logo: String(x.logo ?? x.logoUrl ?? ""),
          title: String(x.title ?? ""),
          subtitle: String(x.subtitle ?? ""),
          organization: String(x.organization ?? ""),
        }))
      );
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load certifications";
      setError(msg);
      toast.error("Error", msg);
    } finally {
      setLoadingCerts(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch(`${API_BASE}/api/landing-page/services-list`, {
        credentials: "include",
      });
      const json = (await response.json().catch(() => null)) as any;
      if (!response.ok || !json?.success) throw new Error(json?.message || "Failed to fetch services");
      const items = (Array.isArray(json.data) ? json.data : []) as any[];
      setServicesData(
        items.map((x) => ({
          id: Number(x.id),
          name: String(x.name ?? ""),
        }))
      );
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load services";
      setError(msg);
      toast.error("Error", msg);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchCerts();
    fetchServices();
  }, []);

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
              currentPage={1}
              itemsPerPage={5}
              totalPages={1}
              onPageChange={() => {}}
              onItemsPerPageChange={() => {}}
              isLoading={loadingCerts}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingCertId(id);
                  setIsCertModalOpen(true);
                }
              }}
              onDelete={async (id) => {
                if (typeof id === "number") {
                  try {
                    const response = await fetch(`${API_BASE}/api/landing-page/certifications/${id}`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    const json = (await response.json().catch(() => null)) as any;
                    if (!response.ok || !json?.success) {
                      throw new Error(json?.message || "Failed to delete certification");
                    }
                    await fetchCerts();
                    toast.success("Success", "Certification deleted successfully");
                  } catch {
                    toast.error("Error", "Failed to delete certification");
                  }
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
              isLoading={loadingServices}
              onEdit={(id) => {
                if (typeof id === "number") {
                  setEditingServiceId(id);
                  setIsServiceModalOpen(true);
                }
              }}
              onDelete={async (id) => {
                if (typeof id === "number") {
                  try {
                    const response = await fetch(`${API_BASE}/api/landing-page/services-list/${id}`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    const json = (await response.json().catch(() => null)) as any;
                    if (!response.ok || !json?.success) {
                      throw new Error(json?.message || "Failed to delete service");
                    }
                    await fetchServices();
                    toast.success("Success", "Service deleted successfully");
                  } catch {
                    toast.error("Error", "Failed to delete service");
                  }
                }
              }}
            />
          </section>

          {error ? (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[11px] text-rose-700">
              {error}
              <button
                type="button"
                onClick={() => {
                  fetchCerts();
                  fetchServices();
                }}
                className="ml-3 rounded-md bg-rose-600 px-2 py-1 text-[11px] font-medium text-white"
              >
                Retry
              </button>
            </div>
          ) : null}
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
        onSubmit={(data) => {
          const logoList = (data.logo as string[] | undefined) ?? [];
          const logo = logoList[0] || "";
          const title = (data.title as string) || "";
          const subtitle = (data.subtitle as string) || "";
          const organization = (data.organization as string) || "";

          (async () => {
            try {
              if (editingCertId != null) {
                const response = await fetch(`${API_BASE}/api/landing-page/certifications/${editingCertId}`, {
                  method: "PUT",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ logo, title, subtitle, organization }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to update certification");
                }
                await fetchCerts();
                toast.success("Success", "Certification updated successfully");
              } else {
                const response = await fetch(`${API_BASE}/api/landing-page/certifications`, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ logo, title, subtitle, organization, orderIndex: certData.length }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to create certification");
                }
                await fetchCerts();
                toast.success("Success", "Certification added successfully");
              }

              setIsCertModalOpen(false);
              setEditingCertId(null);
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Failed to save certification changes";
              toast.error("Error", msg);
            }
          })();
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

          (async () => {
            try {
              if (editingServiceId != null) {
                const response = await fetch(`${API_BASE}/api/landing-page/services-list/${editingServiceId}`, {
                  method: "PUT",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ name }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to update service");
                }
                await fetchServices();
                toast.success("Success", "Service updated successfully");
              } else {
                const response = await fetch(`${API_BASE}/api/landing-page/services-list`, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ name, orderIndex: servicesData.length }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to create service");
                }
                await fetchServices();
                toast.success("Success", "Service added successfully");
              }

              setIsServiceModalOpen(false);
              setEditingServiceId(null);
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Failed to save service changes";
              toast.error("Error", msg);
            }
          })();
        }}
      />
    </div>
  );
};

export default AdminCertServicesPage;
