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

interface PortfolioAdminItem extends Record<string, unknown> {
  id: number;
  images: string[];
  tags: string[];
  description: string;
  title?: string;
  category?: string;
}

const AdminPortfolioPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const [portfolioData, setPortfolioData] = useState<PortfolioAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch portfolio data from backend
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/portfolios');
      const result = await response.json();
      
      if (result.success) {
        setPortfolioData(result.data || []);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      setError('Error connecting to backend API');
      console.error('Error fetching portfolio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    {
      header: "Images",
      accessor: "images",
      type: "text",
      render: (value) => {
        const imgs = (value as string[]) || [];
        return (
          <div className="flex gap-1">
            {imgs.slice(0, 3).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Portfolio ${index + 1}`}
                className="w-12 h-12 object-cover rounded"
              />
            ))}
            {imgs.length > 3 && (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                +{imgs.length - 3}
              </div>
            )}
          </div>
        );
      },
    },
    { header: "Title", accessor: "title", type: "text" },
    { header: "Category", accessor: "category", type: "text" },
    { header: "Tags", accessor: "tags", type: "text" },
    { header: "Description", accessor: "description", type: "textarea" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Portfolio Title",
        type: "text",
        required: true,
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "product-description", label: "Product Description" },
          { value: "social-media", label: "Social Media" },
          { value: "landing-page", label: "Landing Page" },
          { value: "ads-copy", label: "Ads Copy" },
          { value: "articles", label: "Articles" },
          { value: "email-marketing", label: "Email Marketing" },
          { value: "brand-storytelling", label: "Brand Storytelling" },
        ],
      },
      {
        name: "tags",
        label: "Tags",
        type: "text",
        required: false,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
      },
      {
        name: "images",
        label: "Portfolio Images",
        type: "image",
        multiple: true,
      },
    ],
    []
  );

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      // Format tags if it's a string
      const formattedData = {
        ...data,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : data.tags
      };

      if (editingId) {
        // Update existing portfolio
        const response = await fetch(`http://localhost:5000/api/portfolios/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
        
        const result = await response.json();
        if (result.success) {
          await fetchPortfolioData();
          setIsModalOpen(false);
          setEditingId(null);
        } else {
          setError(result.message || 'Failed to update portfolio');
        }
      } else {
        // Create new portfolio
        const response = await fetch('http://localhost:5000/api/portfolios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
        
        const result = await response.json();
        if (result.success) {
          await fetchPortfolioData();
          setIsModalOpen(false);
        } else {
          setError(result.message || 'Failed to create portfolio');
        }
      }
    } catch (err) {
      setError('Error saving portfolio data');
      console.error('Error saving portfolio:', err);
    }
  };

  const handleEdit = (id: number) => {
    const portfolio = portfolioData.find(item => item.id === id);
    if (portfolio) {
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/portfolios/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchPortfolioData();
      } else {
        setError(result.message || 'Failed to delete portfolio');
      }
    } catch (err) {
      setError('Error deleting portfolio');
      console.error('Error deleting portfolio:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="portfolio"
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
              </div>
            )}

            <AdminTable
              columns={columns}
              data={portfolioData}
              isLoading={isLoading}
              onDelete={(id) => id && handleDelete(id)}
              onEdit={(id) => id && handleEdit(id)}
            />
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Portfolio" : "Tambah Portfolio"}
        fields={modalFields}
        initialData={
          editingId != null
            ? (portfolioData.find((item) => item.id === editingId) as
                | Record<string, unknown>
                | undefined)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default AdminPortfolioPage;
