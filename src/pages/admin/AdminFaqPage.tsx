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
import InitialShimmer from "../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../components/ui/skeletons";
import { useAdminToast } from "../../hooks/useAdminToast";

interface FaqItem extends Record<string, unknown> {
  id: number;
  question: string;
  answer: string;
}

const MAX_FAQ = 6;

const AdminFaqPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:55435";

  const [faqData, setFaqData] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/landing-page/faqs`, {
        credentials: "include",
      });
      const json = (await response.json().catch(() => null)) as any;
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || "Failed to fetch FAQs");
      }
      const items = (Array.isArray(json.data) ? json.data : []) as any[];
      setFaqData(
        items.map((x) => ({
          id: Number(x.id),
          question: String(x.question ?? ""),
          answer: String(x.answer ?? ""),
        }))
      );
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load FAQs";
      setError(msg);
      toast.error("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Question", accessor: "question", type: "text" },
    { header: "Answer", accessor: "answer", type: "textarea" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "question",
        label: "Question",
        type: "text",
        placeholder: "Write your question here...",
      },
      {
        name: "answer",
        label: "Answer",
        type: "textarea",
        placeholder: "Write your answer here...",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-24" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="faq"
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
          <AdminHeader title="FAQ Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (faqData.length >= MAX_FAQ) {
                    toast.warning("Limit reached", `FAQ can have up to ${MAX_FAQ} items`);
                    return;
                  }
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={faqData}
                currentPage={1}
                itemsPerPage={6}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                isLoading={loading}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingId(id);
                    setIsModalOpen(true);
                  }
                }}
                onDelete={async (id) => {
                  if (typeof id === "number") {
                    try {
                      const response = await fetch(`${API_BASE}/api/landing-page/faqs/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                      });
                      const json = (await response.json().catch(() => null)) as any;
                      if (!response.ok || !json?.success) {
                        throw new Error(json?.message || "Failed to delete FAQ");
                      }
                      await fetchFaqs();
                      toast.success("Success", "FAQ deleted successfully");
                    } catch {
                      toast.error("Error", "Failed to delete FAQ");
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
                  onClick={fetchFaqs}
                  className="ml-3 rounded-md bg-rose-600 px-2 py-1 text-[11px] font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit FAQ" : "Add FAQ"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (faqData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const question = (data.question as string) || "";
          const answer = (data.answer as string) || "";

          (async () => {
            try {
              if (editingId != null) {
                const response = await fetch(`${API_BASE}/api/landing-page/faqs/${editingId}`, {
                  method: "PUT",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ question, answer }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to update FAQ");
                }
                await fetchFaqs();
                toast.success("Success", "FAQ updated successfully");
              } else {
                if (faqData.length >= MAX_FAQ) {
                  toast.warning("Limit reached", `FAQ can have up to ${MAX_FAQ} items`);
                  return;
                }
                const response = await fetch(`${API_BASE}/api/landing-page/faqs`, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ question, answer, orderIndex: faqData.length }),
                });
                const json = (await response.json().catch(() => null)) as any;
                if (!response.ok || !json?.success) {
                  throw new Error(json?.message || "Failed to create FAQ");
                }
                await fetchFaqs();
                toast.success("Success", "FAQ added successfully");
              }

              setIsModalOpen(false);
              setEditingId(null);
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Failed to save FAQ changes";
              toast.error("Error", msg);
            }
          })();
        }}
      />
    </InitialShimmer>
  );
};

export default AdminFaqPage;
