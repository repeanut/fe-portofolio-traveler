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

const ABOUT_STORAGE_KEY = "landing_about";

interface AboutContent extends Record<string, unknown> {
  id: number;
  image: string;
  description: string;
  experience?: string[];
  exp1Value?: string;
  exp1Label?: string;
  exp2Value?: string;
  exp2Label?: string;
}

const AdminAboutPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [aboutData, setAboutData] = useState<AboutContent[]>(() => {
    const fallback: AboutContent[] = [
      {
        id: 1,
        image: "/rizwords-nomad.jpg",
        description:
          "With over 5 years of experience and a deep understanding of copywriting psychology, marketing funnel, stages of awareness, and market sophistication I'll connect your brand with your target audience's pain points through ads and content. Then present your product as the perfect solution for their problems.",
        experience: ["5+ Years Experience", "100+ Projects"],
      },
    ];

    try {
      const raw = localStorage.getItem(ABOUT_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed)) return parsed as AboutContent[];
    } catch {
      // ignore
    }

    return fallback;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(aboutData));
    } catch {
      // ignore
    }
  }, [aboutData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Image", accessor: "image", type: "image" },
    { header: "Description", accessor: "description", type: "textarea" },
    {
      header: "Experience",
      accessor: "experience",
      type: "text",
      render: (_value, row) => {
        const r = row as AboutContent;
        const fromTags = Array.isArray(r.experience) ? r.experience : [];
        const legacy = [
          [r.exp1Value, r.exp1Label].filter(Boolean).join(" ").trim(),
          [r.exp2Value, r.exp2Label].filter(Boolean).join(" ").trim(),
        ].filter((x) => x);
        const tags = (fromTags.length ? fromTags : legacy).filter((x) => (x ?? "").trim());

        if (tags.length === 0) return "-";

        return (
          <div className="flex flex-wrap gap-2">
            {tags.map((t, idx) => (
              <div
                key={idx}
                className="rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-sky-100"
              >
                {t}
              </div>
            ))}
          </div>
        );
      },
    },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "image",
        label: "About Image",
        type: "image",
        multiple: false,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter a description about you...",
      },
      {
        name: "experience",
        label: "Experience",
        type: "tags",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-24" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="about"
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
          <AdminHeader title="About Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (aboutData.length >= 1) {
                    toast.warning("Limit reached", "About can only have 1 item");
                    return;
                  }
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={aboutData}
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
                onDelete={(id) => {
                  if (typeof id === "number") {
                    try {
                      setAboutData((prev) => prev.filter((item) => item.id !== id));
                      toast.success("Success", "About deleted successfully");
                    } catch {
                      toast.error("Error", "Failed to delete About");
                    }
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit About" : "Add About"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (() => {
                const item = aboutData.find((x) => x.id === editingId);
                if (!item) return undefined;
                const fromTags = Array.isArray(item.experience) ? item.experience : [];
                const legacy = [
                  [item.exp1Value, item.exp1Label].filter(Boolean).join(" ").trim(),
                  [item.exp2Value, item.exp2Label].filter(Boolean).join(" ").trim(),
                ].filter((x) => x);
                return {
                  ...item,
                  experience: fromTags.length ? fromTags : legacy,
                } as Record<string, unknown>;
              })()
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(data) => {
          const imageList = (data.image as string[] | undefined) ?? [];
          const image = imageList[0] || "";
          const description = (data.description as string) || "";
          const experience = ((data.experience as string[] | undefined) ?? []).map((x) => x.trim()).filter(Boolean);

          try {
            if (editingId != null) {
              setAboutData((prev) =>
                prev.map((item) =>
                  item.id === editingId
                    ? {
                        ...item,
                        image: image || item.image,
                        description: description || item.description,
                        experience: experience.length ? experience : item.experience,
                      }
                    : item
                )
              );
              toast.success("Success", "About updated successfully");
            } else {
              setAboutData((prev) => {
                if (prev.length >= 1) {
                  toast.warning("Limit reached", "About can only have 1 item");
                  return prev;
                }
                const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    image,
                    description,
                    experience,
                  },
                ];
              });
              toast.success("Success", "About added successfully");
            }

            setIsModalOpen(false);
            setEditingId(null);
          } catch {
            toast.error("Error", "Failed to save About changes");
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminAboutPage;
