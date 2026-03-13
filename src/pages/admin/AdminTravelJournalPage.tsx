import React, { useEffect, useState } from "react";
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
  travelImage: string;
  description: string;
  location: string;
  date: string;
  category: string;
  tags: string[];
  isActive: boolean;
  featured: boolean;
  author: string;
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
  const [travelImage, setTravelImage] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("adventure");
  const [tags, setTags] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    console.log('Modal opened with initialData:', initialData);
    if (initialData && initialData._id) {
      console.log('Loading data for edit:', initialData);
      setName(initialData.name || "");
      setCover(initialData.cover || "");
      setTravelImage(initialData.travelImage || "");
      setDescription(initialData.description || "");
      setLocation(initialData.location || "");
      setDate(initialData.date || "");
      setCategory(initialData.category || "adventure");
      setTags(initialData.tags || []);
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
      setFeatured(initialData.featured || false);
    } else {
      console.log('Reset form for new entry');
      // Reset form for new entry
      setName("");
      setCover("");
      setTravelImage("");
      setDescription("");
      setLocation("");
      setDate("");
      setCategory("adventure");
      setTags([]);
      setIsActive(true);
      setFeatured(false);
    }
    setIsSaving(false);
    setFormErrors({});
  }, [isOpen, initialData]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!cover) {
      errors.cover = 'Cover image is required';
    }
    
    if (!travelImage) {
      errors.travelImage = 'Travel image is required';
    }
    
    if (!location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await onSubmit({ 
        name, 
        cover, 
        travelImage,
        description,
        location,
        date,
        category,
        tags,
        isActive,
        featured,
        author: 'TRAVELLO Team' // Tambah author field
      });
    } finally {
      setIsSaving(false);
    }
  };

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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 px-5 py-4 md:grid-cols-2 md:gap-0 md:divide-x md:divide-slate-200">
            <div className="space-y-4 md:pr-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Name Highlight
                </label>
                <input
                  type="text"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Bali, Tokyo, Alps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.name}</p>
                )}
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
                      Remove cover
                    </button>
                  </div>
                ) : null}
                {formErrors.cover && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.cover}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Travel Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      readFilesAsDataUrls([file])
                        .then(([dataUrl]) => setTravelImage(dataUrl))
                        .catch(() => {
                        });
                    }}
                  />
                </div>

                {travelImage ? (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={travelImage} alt="Travel" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelImage("")}
                      className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Remove travel image
                    </button>
                  </div>
                ) : null}
                {formErrors.travelImage && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.travelImage}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 md:pl-8">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe this travel destination..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.location ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Bali, Indonesia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.location}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Date
                </label>
                <input
                  type="date"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.date ? 'border-red-300' : 'border-slate-200'
                  }`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {formErrors.date && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.date}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Category
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="adventure">Adventure</option>
                  <option value="beach">Beach</option>
                  <option value="mountain">Mountain</option>
                  <option value="city">City</option>
                  <option value="cultural">Cultural</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. beach, temple, culture"
                  value={tags.join(', ')}
                  onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Active</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TravelHighlight extends Record<string, unknown> {
  _id: string;
  name: string;
  cover: string;
  travelImage: string;
  description: string;
  location: string;
  date: string;
  category: string;
  tags: string[];
  isActive: boolean;
  featured: boolean;
  views: number;
  likes: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

const AdminTravelJournalPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:55435";

  const [travelData, setTravelData] = useState<TravelHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch travel journals from backend
  const fetchTravelJournals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/travel-journal`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch travel journals');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setTravelData(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'No data received');
      }
    } catch (err) {
      console.error('Error fetching travel journals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load travel journals');
      toast.error('Error', 'Failed to load travel journals');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTravelJournals();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: Column[] = [
    { header: "Name Highlight", accessor: "name", type: "text" },
    { header: "Cover", accessor: "cover", type: "image" },
    {
      header: "Travel Image",
      accessor: "travelImage",
      type: "image",
    },
    { header: "Location", accessor: "location", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-48" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
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

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
          <AdminHeader title="Travel Journal Management" />

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
                  <button 
                    onClick={fetchTravelJournals}
                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              <AdminTable
                columns={columns}
                data={travelData}
                currentPage={1}
                itemsPerPage={5}
                totalPages={1}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
                isLoading={loading}
                onEdit={(id) => {
                  if (typeof id === "string") {
                    console.log('Edit clicked for ID:', id);
                    console.log('Available data:', travelData);
                    const foundItem = travelData.find((item) => item._id === id);
                    console.log('Found item:', foundItem);
                    setEditingId(id);
                    setIsModalOpen(true);
                  }
                }}
                onDelete={async (id) => {
                  if (typeof id === "string") {
                    try {
                      const response = await fetch(`${API_BASE}/api/travel-journal/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                      });
                      
                      if (response.ok) {
                        setTravelData((prev) => prev.filter((item) => item._id !== id));
                        toast.success("Success", "Travel journal deleted successfully");
                      } else {
                        throw new Error('Failed to delete');
                      }
                    } catch {
                      toast.error("Error", "Failed to delete travel journal");
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
        initialData={editingId != null ? travelData.find((item) => item._id === editingId) : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (payload) => {
          try {
            console.log('Submitting payload:', payload);
            
            if (editingId != null) {
              // Update existing journal
              console.log('Updating journal with ID:', editingId);
              const response = await fetch(`${API_BASE}/api/travel-journal/${editingId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });
              
              if (response.ok) {
                await fetchTravelJournals();
                toast.success("Success", "Travel journal updated successfully");
              } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update travel journal');
              }
            } else {
              // Create new journal
              console.log('Creating new journal');
              const response = await fetch(`${API_BASE}/api/travel-journal`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });
              
              if (response.ok) {
                await fetchTravelJournals();
                toast.success("Success", "Travel journal added successfully");
              } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create travel journal');
              }
            }

            setIsModalOpen(false);
            setEditingId(null);
          } catch (err) {
            console.error('Save error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error("Error", `Failed to save travel journal: ${errorMessage}`);
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTravelJournalPage;
