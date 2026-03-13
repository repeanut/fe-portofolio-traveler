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
import { useAdminToast } from "../../../hooks/useAdminToast";

interface PortfolioItem extends Record<string, unknown> {
  _id: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  projectUrl?: string;
  technologies?: string[];
  tags?: string[];
  featured: boolean;
  isActive: boolean;
  client: string;
  projectDate?: string;
  author: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

type PortfolioPayload = {
  title: string;
  description: string;
  category: string;
  image: string;
  client: string;
  projectDate: string;
  technologies: string[];
  projectUrl: string;
  tags: string[];
  featured: boolean;
  isActive: boolean;
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

const PortfolioModal: React.FC<{
  isOpen: boolean;
  title: string;
  initialData?: PortfolioItem;
  onClose: () => void;
  onSubmit: (payload: PortfolioPayload) => void;
}> = ({ isOpen, title, initialData, onClose, onSubmit }) => {
  const [titleState, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("website");
  const [image, setImage] = useState<string>("");
  const [client, setClient] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projectUrl, setProjectUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData && initialData._id) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "website");
      setImage(initialData.image || "");
      setClient(initialData.client || "");
      setProjectDate(initialData.projectDate || "");
      setTechnologies(initialData.technologies || []);
      setProjectUrl(initialData.projectUrl || "");
      setTags(initialData.tags || []);
      setFeatured(initialData.featured || false);
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
    } else {
      // Reset form for new entry
      setTitle("");
      setDescription("");
      setCategory("website");
      setImage("");
      setClient("");
      setProjectDate("");
      setTechnologies([]);
      setProjectUrl("");
      setTags([]);
      setFeatured(false);
      setIsActive(true);
    }
    setIsSaving(false);
    setFormErrors({});
  }, [isOpen, initialData]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!titleState.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!image) {
      errors.image = 'Project image is required';
    }
    
    if (!client.trim()) {
      errors.client = 'Client name is required';
    }
    
    if (!projectDate) {
      errors.projectDate = 'Project date is required';
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
        title: titleState, 
        description,
        category,
        image,
        client,
        projectDate,
        technologies,
        projectUrl,
        tags,
        featured,
        isActive,
        author: 'TRAVELLO Team'
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
                  Project Title
                </label>
                <input
                  type="text"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.title ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Travel Website Design"
                  value={titleState}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Client Name
                </label>
                <input
                  type="text"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.client ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="e.g. TravelGo Agency"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
                {formErrors.client && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.client}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Project Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      readFilesAsDataUrls([file])
                        .then(([dataUrl]) => setImage(dataUrl))
                        .catch(() => {
                        });
                    }}
                  />
                </div>

                {image ? (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={image} alt="Project" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
                {formErrors.image && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.image}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Project Date
                </label>
                <input
                  type="date"
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    formErrors.projectDate ? 'border-red-300' : 'border-slate-200'
                  }`}
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                />
                {formErrors.projectDate && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.projectDate}</p>
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
                  placeholder="Describe this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-[10px] mt-1">{formErrors.description}</p>
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
                  <option value="website">Website</option>
                  <option value="mobile">Mobile</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="content">Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={technologies.join(', ')}
                  onChange={(e) => setTechnologies(e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Project URL
                </label>
                <input
                  type="url"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://example.com"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. travel, booking, responsive"
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

const AdminPortfolioPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useAdminToast();

  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:55435";

  // Fetch portfolios from backend API
  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/portfolio`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setPortfolioData(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'No data received');
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
      toast.error('Error', 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPortfolios();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: Column[] = [
    { header: "Title", accessor: "title", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Client", accessor: "client", type: "text" },
    { header: "Image", accessor: "image", type: "image" },
    { header: "Featured", accessor: "featured", type: "text" },
    { header: "Active", accessor: "isActive", type: "text" },
    { header: "Action", accessor: "action", type: "action" },
  ];


  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-48" rows={6} />}>
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
                onAddClick={() => {
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                  <button 
                    onClick={fetchPortfolios}
                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
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
                isLoading={loading}
                onEdit={(id) => {
                  if (typeof id === "string") {
                    console.log('Edit clicked for ID:', id);
                    console.log('Available data:', portfolioData);
                    const foundItem = portfolioData.find((item) => item._id === id);
                    console.log('Found item:', foundItem);
                    setEditingId(id);
                    setIsModalOpen(true);
                  }
                }}
                onDelete={async (id) => {
                  console.log('Delete function called with ID:', id);
                  if (typeof id === "string") {
                    // Add confirmation dialog
                    const isConfirmed = window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.');
                    console.log('User confirmation result:', isConfirmed);
                    
                    if (!isConfirmed) {
                      console.log('Delete action cancelled by user');
                      return;
                    }
                    
                    console.log('Delete confirmed for ID:', id);
                    try {
                      console.log('Sending DELETE request to:', `${API_BASE}/api/portfolio/${id}`);
                      const response = await fetch(`${API_BASE}/api/portfolio/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        }
                      });
                      
                      const responseData = await response.json().catch(() => ({} as any));
                      console.log('DELETE response status:', response.status);
                      console.log('DELETE response ok:', response.ok);
                      console.log('DELETE response data:', responseData);
                      
                      if (response.ok) {
                        console.log('Delete successful, updating portfolio data');
                        setPortfolioData((prev) => prev.filter((item) => item._id !== id));
                        
                        // Try toast first, fallback to alert
                        try {
                          toast.success("Success", "Portfolio deleted successfully");
                        } catch (toastError) {
                          console.log('Toast failed, using alert fallback');
                          alert("Portfolio deleted successfully");
                        }
                      } else {
                        console.log('Delete failed, response not ok');
                        const errorMessage = (responseData as any)?.message || 'Failed to delete portfolio';
                        throw new Error(errorMessage);
                      }
                    } catch (error) {
                      console.log('Delete error caught:', error);
                      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                      
                      // Try toast first, fallback to alert
                      try {
                        toast.error("Error", `Failed to delete portfolio: ${errorMessage}`);
                      } catch (toastError) {
                        console.log('Toast failed, using alert fallback');
                        alert(`Failed to delete portfolio: ${errorMessage}`);
                      }
                    }
                  }
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <PortfolioModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Portfolio" : "Tambah Portfolio"}
        initialData={editingId != null ? portfolioData.find((item) => item._id === editingId) : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (payload) => {
          try {
            console.log('Submitting payload:', payload);
            
            if (editingId != null) {
              // Update existing portfolio
              console.log('Updating portfolio with ID:', editingId);
              const response = await fetch(`${API_BASE}/api/portfolio/${editingId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });
              
              if (response.ok) {
                await fetchPortfolios();
                toast.success("Success", "Portfolio updated successfully");
              } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update portfolio');
              }
            } else {
              // Create new portfolio
              console.log('Creating new portfolio');
              const response = await fetch(`${API_BASE}/api/portfolio`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              });
              
              if (response.ok) {
                await fetchPortfolios();
                toast.success("Success", "Portfolio added successfully");
              } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create portfolio');
              }
            }

            setIsModalOpen(false);
            setEditingId(null);
          } catch (err) {
            console.error('Save error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error("Error", `Failed to save portfolio: ${errorMessage}`);
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminPortfolioPage;
