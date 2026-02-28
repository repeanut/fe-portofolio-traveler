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

interface TravelHighlight extends Record<string, unknown> {
  id: number;
  name: string;
  cover: string;
  images: string[];
}

const AdminTravelJournalPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const [travelData, setTravelData] = useState<TravelHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch travel journal data from backend
  useEffect(() => {
    fetchTravelData();
  }, []);

  const fetchTravelData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/travel-journal');
      const result = await response.json();
      
      if (result.success) {
        setTravelData(result.data.journals || []);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch travel journal data');
      }
    } catch (err) {
      setError('Error connecting to backend API');
      console.error('Error fetching travel journal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      },
      {
        name: "cover",
        label: "Cover Image",
        type: "image",
      },
      {
        name: "images",
        label: "Travel Images",
        type: "image",
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
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
                isLoading={isLoading}
                onEdit={(id) => {
                  if (typeof id === "number") {
                    setEditingId(id);
                    setIsModalOpen(true);
                  }
                }}
                onDelete={async (id) => {
                  if (typeof id === "number") {
                    if (!confirm('Are you sure you want to delete this travel journal?')) {
                      return;
                    }

                    try {
                      const response = await fetch(`http://localhost:5000/api/travel-journal/${id}`, {
                        method: 'DELETE'
                      });
                      
                      const result = await response.json();
                      if (result.success) {
                        await fetchTravelData();
                      } else {
                        setError(result.message || 'Failed to delete travel journal');
                      }
                    } catch (err) {
                      setError('Error deleting travel journal');
                      console.error('Error deleting travel journal:', err);
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
        title={editingId ? "Edit Travel Highlight" : "Tambah Travel Highlight"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (travelData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (data) => {
          try {
            const name = (data.name as string) || "";
            const coverList = (data.cover as string[] | undefined) ?? [];
            const images = (data.images as string[] | undefined) ?? [];
            const cover = coverList[0] || "";

            if (editingId != null) {
              // Update existing travel journal
              const response = await fetch(`http://localhost:5000/api/travel-journal/${editingId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, cover, images })
              });
              
              const result = await response.json();
              if (result.success) {
                await fetchTravelData();
                setIsModalOpen(false);
                setEditingId(null);
              } else {
                setError(result.message || 'Failed to update travel journal');
              }
            } else {
              // Create new travel journal
              const response = await fetch('http://localhost:5000/api/travel-journal', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, cover, images })
              });
              
              const result = await response.json();
              if (result.success) {
                await fetchTravelData();
                setIsModalOpen(false);
              } else {
                setError(result.message || 'Failed to create travel journal');
              }
            }
          } catch (err) {
            setError('Error saving travel journal data');
            console.error('Error saving travel journal:', err);
          }
        }}
      />
    </InitialShimmer>
  );
};

export default AdminTravelJournalPage;
