import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminTableHeader from "../../components/admin/AdminTableHeader";
import AdminTable from "../../components/admin/AdminTable";
import type { Column } from "../../components/admin/AdminTable";
import AdminModal, { type AdminModalField } from "../../components/admin/AdminModal";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../components/ui/skeletons";
import { useAdminToast } from "../../hooks/useAdminToast";

const readFilesAsDataUrls = async (files: File[]) => {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        })
    )
  );
};

type HeroContentModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  initialDescription: string;
  initialBadge: string;
  initialBrands: string[];
  onClose: () => void;
  onSubmit: (data: { description: string; badge: string; brands: string[] }) => void;
};

const HeroContentModal: React.FC<HeroContentModalProps> = ({
  isOpen,
  mode,
  initialDescription,
  initialBadge,
  initialBrands,
  onClose,
  onSubmit,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [badge, setBadge] = useState(initialBadge);
  const [brands, setBrands] = useState<string[]>(initialBrands);
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDescription(initialDescription);
    setBadge(initialBadge);
    setBrands(initialBrands);
    setReplaceIndex(null);
  }, [initialBadge, initialBrands, initialDescription, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {mode === "edit" ? "Edit Hero Content" : "Add Hero Content"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75l10.5 10.5m0-10.5l-10.5 10.5" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 px-5 py-4 md:grid-cols-2 md:divide-x md:divide-slate-200">
          <div className="space-y-6 md:pr-8">
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter hero text..."
                className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-700">Badge</label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Enter badge label..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4 md:pl-8">
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              className="h-10 w-full rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              + Add Logo Brands
            </button>
            <input
              ref={addInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                if (list.length === 0) return;
                try {
                  const dataUrls = await readFilesAsDataUrls(list);
                  setBrands((prev) => [...prev, ...dataUrls].slice(0, 12));
                } catch {
                  // ignore
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                if (list.length === 0) return;
                if (replaceIndex == null) return;
                try {
                  const dataUrls = await readFilesAsDataUrls([list[0]]);
                  setBrands((prev) => prev.map((x, idx) => (idx === replaceIndex ? dataUrls[0] : x)));
                } catch {
                  // ignore
                } finally {
                  setReplaceIndex(null);
                  e.currentTarget.value = "";
                }
              }}
            />

            <div className="space-y-3">
              {brands.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-[11px] text-slate-500">
                  No brand logos yet.
                </div>
              ) : (
                brands.map((src, idx) => (
                  <div key={`${src}-${idx}`} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-white">
                        <img src={src} alt="Brand" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-900 truncate">Brand Logo {idx + 1}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(idx);
                          replaceInputRef.current?.click();
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        aria-label="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 013.182 3.182L7.125 20.588l-4.5 1.125 1.125-4.5L16.862 4.487z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrands((prev) => prev.filter((_, i) => i !== idx))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        aria-label="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0l-1 14a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ description, badge, brands })}
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-xs hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminHeroManagementPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  // State for hero text/brands table
  const [heroBrandsData, setHeroBrandsData] = useState<
    Array<{
      id: number;
      description: string;
      badge: string;
      brands: string[];
    }>
  >([
    {
      id: 1,
      description:
        "Bridging the gap between global marketing strategy and authentic storytelling. Based in Bali, working globally.",
      badge: "Digital Nomad & Creative Strategist",
      brands: [
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
        "/Amazon-Logo 1.png",
      ],
    },
  ]);

  // State for hero image table
  const [heroImageData, setHeroImageData] = useState<
    Array<{
      id: number;
      mainImage: string;
    }>
  >([
    {
      id: 1,
      mainImage: "/foto 2.jpg",
    },
    {
      id: 2,
      mainImage: "/foto 1.jpg",
    },
  ]);

  // Modal state for hero text/brands
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroId, setEditingHeroId] = useState<number | null>(null);

  // Modal state for hero image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const heroTextColumns: Column[] = [
    { header: "Description", accessor: "description", type: "textarea" },
    { header: "Badge", accessor: "badge", type: "text" },
    {
      header: "Featured Brands",
      accessor: "brands",
      type: "text",
      render: (value) => {
        const brands = (value as string[]) || [];
        return (
          <div className="flex flex-wrap items-center gap-2">
            {brands.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Brand logo"
                className="h-4 md:h-5 object-contain"
              />
            ))}
          </div>
        );
      },
    },
    { header: "Action", accessor: "action", type: "action" },
  ];

  // Columns for Hero image management
  const heroImageColumns: Column[] = [
    { header: "Main Image", accessor: "mainImage", type: "image" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const heroImageFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "mainImage",
        label: "Main Image URL",
        type: "image",
        placeholder: "/foto-hero.jpg",
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-44" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        {/* Sidebar */}
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="hero"
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

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
          <AdminHeader title="Hero Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            {/* Top: Hero text management */}
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  if (heroBrandsData.length >= 1) {
                    toast.warning("Limit reached", "Hero text can only have 1 item");
                    return;
                  }
                  setEditingHeroId(null);
                  setIsHeroModalOpen(true);
                }}
              />

              {/* Table */}
              <AdminTable
                columns={heroTextColumns}
                data={heroBrandsData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingHeroId(id);
                    setIsHeroModalOpen(true);
                  }
                }}
                onDelete={(id) => {
                  if (typeof id === "number") {
                    try {
                      setHeroBrandsData((prev) => prev.filter((item) => item.id !== id));
                      toast.success("Success", "Hero text deleted successfully");
                    } catch {
                      toast.error("Error", "Failed to delete hero text");
                    }
                  }
                }}
              />
            </section>

            {/* Bottom: Hero image management */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Hero Image Management</h2>
              </div>

              <AdminTableHeader
                onAddClick={() => {
                  if (heroImageData.length >= 7) {
                    toast.warning("Limit reached", "Hero images can have up to 7 items");
                    return;
                  }
                  setEditingImageId(null);
                  setIsImageModalOpen(true);
                }}
              />

              {/* Table */}
              <AdminTable
                columns={heroImageColumns}
                data={heroImageData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingImageId(id);
                    setIsImageModalOpen(true);
                  }
                }}
                onDelete={(id) => {
                  if (typeof id === "number") {
                    try {
                      setHeroImageData((prev) => prev.filter((item) => item.id !== id));
                      toast.success("Success", "Hero image deleted successfully");
                    } catch {
                      toast.error("Error", "Failed to delete hero image");
                    }
                  }
                }}
              />
            </section>
          </div>
        </div>

        {/* Hero text / brands modal */}
        <HeroContentModal
          isOpen={isHeroModalOpen}
          mode={editingHeroId != null ? "edit" : "create"}
          initialDescription={
            editingHeroId != null
              ? heroBrandsData.find((item) => item.id === editingHeroId)?.description ?? ""
              : ""
          }
          initialBadge={
            editingHeroId != null
              ? heroBrandsData.find((item) => item.id === editingHeroId)?.badge ?? ""
              : ""
          }
          initialBrands={
            editingHeroId != null
              ? heroBrandsData.find((item) => item.id === editingHeroId)?.brands ?? []
              : []
          }
          onClose={() => {
            setIsHeroModalOpen(false);
            setEditingHeroId(null);
          }}
          onSubmit={(data) => {
            try {
              if (editingHeroId != null) {
                setHeroBrandsData((prev) =>
                  prev.map((item) =>
                    item.id === editingHeroId
                      ? {
                          ...item,
                          description: data.description || item.description,
                          badge: data.badge || item.badge,
                          brands: data.brands.length > 0 ? data.brands : item.brands,
                        }
                      : item
                  )
                );
                toast.success("Success", "Hero text updated successfully");
              } else {
                setHeroBrandsData((prev) => {
                  if (prev.length >= 1) {
                    toast.warning("Limit reached", "Hero text can only have 1 item");
                    return prev;
                  }
                  const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                  return [
                    ...prev,
                    {
                      id: nextId,
                      description: data.description || "",
                      badge: data.badge || "",
                      brands: data.brands,
                    },
                  ];
                });
                toast.success("Success", "Hero text added successfully");
              }

              setIsHeroModalOpen(false);
              setEditingHeroId(null);
            } catch {
              toast.error("Error", "Failed to save hero text changes");
            }
          }}
        />

        {/* Hero image modal */}
        <AdminModal
          isOpen={isImageModalOpen}
          title={editingImageId ? "Edit Hero Image" : "Add Hero Image"}
          fields={heroImageFields}
          initialData={
            editingImageId != null
              ? (heroImageData.find((item) => item.id === editingImageId) as
                  | Record<string, unknown>
                  | undefined)
              : undefined
          }
          onClose={() => {
            setIsImageModalOpen(false);
            setEditingImageId(null);
          }}
          onSubmit={(data) => {
            const mainImage = (data.mainImage as string) || "";

            try {
              if (editingImageId != null) {
                setHeroImageData((prev) =>
                  prev.map((item) =>
                    item.id === editingImageId
                      ? {
                          ...item,
                          mainImage: mainImage || item.mainImage,
                        }
                      : item
                  )
                );
                toast.success("Success", "Hero image updated successfully");
              } else {
                setHeroImageData((prev) => {
                  if (prev.length >= 7) {
                    toast.warning("Limit reached", "Hero images can have up to 7 items");
                    return prev;
                  }
                  const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                  return [
                    ...prev,
                    {
                      id: nextId,
                      mainImage,
                    },
                  ];
                });
                toast.success("Success", "Hero image added successfully");
              }

              setIsImageModalOpen(false);
              setEditingImageId(null);
            } catch {
              toast.error("Error", "Failed to save hero image changes");
            }
          }}
        />
      </div>
    </InitialShimmer>
  );
};

export default AdminHeroManagementPage;
