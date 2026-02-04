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
import { useAdminToast } from "../../hooks/useAdminToast";

interface TravelHighlight extends Record<string, unknown> {
  id: number;
  name: string;
  cover: string;
  images: string[];
  createdAt?: string;
  timestamp?: string;
  status?: string;
}

const AdminTravelJournalPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [travelData, setTravelData] = useState<TravelHighlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch travel journals from API
  useEffect(() => {
    fetchTravelJournals();
  }, []);

  const fetchTravelJournals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/travel-journal');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTravelData(result.data.journals);
        setError(null);
        console.log('✅ Travel journals loaded:', result.data.journals);
      } else {
        setError(result.message || 'Failed to fetch travel journals');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error connecting to backend API';
      setError(errorMessage);
      console.error('Error fetching travel journals:', err);
      
      // Fallback to hardcoded data if API fails
      setTravelData([
        {
          id: 1,
          name: "Bali",
          cover: "/foto 2.jpg",
          images: ["/foto 2.jpg", "/foto 5.jpg", "/foto 7.jpg"],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: "54w",
          status: "active"
        },
        {
          id: 2,
          name: "Tokyo",
          cover: "/foto 1.jpg",
          images: ["/foto 1.jpg"],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: "12w",
          status: "active"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveTravelJournal = async (data: Partial<TravelHighlight>, id?: number) => {
    try {
      const url = id 
        ? `http://localhost:5000/api/travel-journal/${id}`
        : 'http://localhost:5000/api/travel-journal';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTravelJournals(); // Refresh data
        return result.data.journal;
      } else {
        throw new Error(result.message || 'Failed to save travel journal');
      }
    } catch (err: any) {
      // Fallback to local state update if API fails
      console.warn('API failed, using local state:', err.message);
      
      if (id) {
        setTravelData(prev => prev.map(item => 
          item.id === id ? { ...item, ...data } : item
        ));
      } else {
        const newItem: TravelHighlight = {
          id: travelData.length > 0 ? Math.max(...travelData.map(j => j.id)) + 1 : 1,
          name: data.name || 'Untitled',
          cover: data.cover || '',
          images: data.images || [],
          createdAt: new Date().toISOString(),
          timestamp: 'Just now',
          status: 'active'
        };
        setTravelData(prev => [...prev, newItem]);
      }
      
      return { ...data, id: id || travelData.length + 1 };
    }
  };

  const deleteTravelJournal = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/travel-journal/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        await fetchTravelJournals(); // Refresh data
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete travel journal');
      }
    } catch (err: any) {
      // Fallback to local state update if API fails
      console.warn('API failed, using local state:', err.message);
      setTravelData(prev => prev.filter(item => item.id !== id));
      return true;
    }
  };

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

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name Highlight",
        type: "text",
        placeholder: "Misal: Bali, Tokyo, Alps",
        required: true,
      },
      {
        name: "cover",
        label: "Cover Image",
        type: "image",
        required: true,
      },
      {
        name: "images",
        label: "Travel Images",
        type: "image",
        multiple: true,
        required: false,
      },
    ],
    []
  );

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-40" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar
          active={activeMenu}
          landingActiveKey="travel"
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

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading travel journals...</span>
                </div>
              )}

              {!loading && travelData.length === 0 && !error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No travel journals found</h3>
                  <p className="text-gray-600">Start by adding your first travel journal.</p>
                </div>
              )}

              {!loading && travelData.length > 0 && (
                <AdminTable
                  columns={columns}
                  data={travelData}
                  currentPage={1}
                  itemsPerPage={5}
                  totalPages={1}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  onPreview={(id) => {
                    if (typeof id === "number") {
                      // Open travel journal in main page
                      window.open(`/#stories?highlight=${id}`, '_blank');
                    }
                  }}
                  onEdit={(id) => {
                    if (typeof id === "number") {
                      setEditingId(id);
                      setIsModalOpen(true);
                    }
                  }}
                  onDelete={async (id) => {
                    if (typeof id === "number") {
                      try {
                        await deleteTravelJournal(id);
                        toast.success("Berhasil", "Travel highlight berhasil dihapus");
                      } catch (error: any) {
                        toast.error("Gagal", error?.message || "Travel highlight gagal dihapus");
                      }
                    }
                  }}
                />
              )}
            </section>
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Travel Highlight" : "Tambah Travel Highlight"}
        fields={modalFields}
        initialData={
          editingId != null
            ? travelData.find((item) => item.id === editingId)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (data) => {
          try {
            const name = (data.name as string)?.trim() || "";
            const coverList = (data.cover as string[] | undefined) ?? [];
            const imagesList = (data.images as string[] | undefined) ?? [];
            const cover = Array.isArray(coverList) ? coverList[0] : coverList;
            const images = Array.isArray(imagesList) ? imagesList : imagesList ? [imagesList] : [];

            if (!name) {
              toast.error("Gagal", "Name highlight is required");
              return;
            }

            if (!cover) {
              toast.error("Gagal", "Cover image is required");
              return;
            }

            await saveTravelJournal({ name, cover, images }, editingId || undefined);
            
            if (editingId != null) {
              toast.success("Berhasil", "Travel highlight berhasil diperbarui");
            } else {
              toast.success("Berhasil", "Travel highlight berhasil ditambahkan");
            }

            setIsModalOpen(false);
            setEditingId(null);
          } catch (error: any) {
            toast.error("Gagal", error?.message || "Perubahan travel highlight gagal disimpan");
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTravelJournalPage;
