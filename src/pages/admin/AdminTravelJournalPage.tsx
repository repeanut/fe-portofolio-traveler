import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminTableHeader from "../../components/admin/AdminTableHeader";
import AdminTable from "../../components/admin/AdminTable";
import type { Column } from "../../components/admin/AdminTable";
import InitialShimmer from "../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../components/ui/skeletons";
import { useAdminToast } from "../../hooks/useAdminToast";

type TravelContentPayload = {
  name: string;
  cover: string;
  images: string[];
};

const readFilesAsDataUrls = (files: File[]) =>
  Promise.all(
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

const TravelContentModal: React.FC<{
  isOpen: boolean;
  title: string;
  initialData?: TravelHighlight;
  onClose: () => void;
  onSubmit: (payload: TravelContentPayload) => void;
}> = ({ isOpen, title, initialData, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [cover, setCover] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name ?? "");
    setCover(initialData?.cover ?? "");
    setImages(initialData?.images ?? []);
    setIsSaving(false);
    setReplaceIndex(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsSaving(true);
            try {
              onSubmit({ name, cover, images });
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="grid gap-6 px-5 py-4 md:grid-cols-2 md:gap-0 md:divide-x md:divide-slate-200">
            <div className="space-y-4 md:pr-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Name Highlight
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Misal: Bali, Tokyo, Alps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      readFilesAsDataUrls([file])
                        .then(([dataUrl]) => setCover(dataUrl))
                        .catch(() => {
                        });
                    }}
                  />
                </div>

                {cover ? (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={cover} alt="Cover" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Hapus Cover
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 md:pl-8">
              <button
                type="button"
                onClick={() => addInputRef.current?.click()}
                className="h-10 w-full rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                + Add Travel Images
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
                    setImages((prev) => [...prev, ...dataUrls]);
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
                    setImages((prev) => prev.map((x, idx) => (idx === replaceIndex ? dataUrls[0] : x)));
                  } catch {
                    // ignore
                  } finally {
                    setReplaceIndex(null);
                    e.currentTarget.value = "";
                  }
                }}
              />

              <div className="space-y-3">
                {images.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-[11px] text-slate-500">
                    Belum ada travel images.
                  </div>
                ) : (
                  images.map((src, idx) => (
                    <div key={`${src}-${idx}`} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-white">
                          <img src={src} alt="Travel" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-slate-900 truncate">Travel Image {idx + 1}</p>
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
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
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
              className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TravelHighlight extends Record<string, unknown> {
  id: number;
  name: string;
  cover: string;
  images: string[];
}

const AdminTravelJournalPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [travelData, setTravelData] = useState<TravelHighlight[]>([
    {
      id: 1,
      name: "Bali",
      cover: "/foto 2.jpg",
      images: ["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"],
    },
    {
      id: 2,
      name: "Tokyo",
      cover: "/foto 1.jpg",
      images: ["/foto 1.jpg"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const columns: Column[] = [
    { header: "Name Highlight", accessor: "name", type: "text" },
    { header: "Cover", accessor: "cover", type: "image" },
    {
      header: "Travel Image",
      accessor: "images",
      type: "text",
      render: (value) => {
        const urls = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-2">
            {urls.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Travel"
                className="h-8 w-8 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        );
      },
    },
    { header: "Action", accessor: "action", type: "action" },
  ];

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-40" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="travel"
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

        <div className="flex flex-1 flex-col px-8 py-6 overflow-hidden">
          <AdminHeader title="Travel Journal Management" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                onAddClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />

              <AdminTable
                columns={columns}
                data={travelData}
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
                      setTravelData((prev) => prev.filter((item) => item.id !== id));
                      toast.success("Berhasil", "Travel highlight berhasil dihapus");
                    } catch {
                      toast.error("Gagal", "Travel highlight gagal dihapus");
                    }
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <TravelContentModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Travel Highlight" : "Tambah Travel Highlight"}
        initialData={editingId != null ? travelData.find((item) => item.id === editingId) : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={(payload) => {
          const name = payload.name || "";
          const cover = payload.cover || "";
          const images = payload.images ?? [];

          try {
            if (editingId != null) {
              setTravelData((prev) =>
                prev.map((item) =>
                  item.id === editingId
                    ? {
                        ...item,
                        name: name || item.name,
                        cover: cover || item.cover,
                        images: images.length ? images : item.images,
                      }
                    : item
                )
              );
              toast.success("Berhasil", "Travel highlight berhasil diperbarui");
            } else {
              setTravelData((prev) => {
                const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
                return [
                  ...prev,
                  {
                    id: nextId,
                    name,
                    cover,
                    images,
                  },
                ];
              });
              toast.success("Berhasil", "Travel highlight berhasil ditambahkan");
            }

            setIsModalOpen(false);
            setEditingId(null);
          } catch {
            toast.error("Gagal", "Perubahan travel highlight gagal disimpan");
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTravelJournalPage;
