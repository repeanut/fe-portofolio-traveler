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
import { useAdminToast } from "../../hooks/useAdminToast";

interface ExperienceItem extends Record<string, unknown> {
  _id: string;
  title: string;
  company: string;
  position: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string | null;
  currentJob: boolean;
  location: string;
  type: string;
  department: string;
  achievements: string[];
  technologies: string[];
  responsibilities: string[];
  skills: string[];
  featured: boolean;
  isActive: boolean;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const AdminExperiencePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("landing");
  const navigate = useNavigate();
  const toast = useAdminToast();
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:55435";
  const [experienceData, setExperienceData] = useState<ExperienceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch experience data from backend
  const fetchExperienceData = async (page = currentPage, limit = itemsPerPage) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`${API_BASE}/api/experience?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch experience data');
      }
      
      const result = await response.json();
      if (result.success) {
        setExperienceData(result.data);
        setTotalPages(result.pagination?.pages || 1);
        setCurrentPage(result.pagination?.current || 1);
      } else {
        throw new Error(result.message || 'Failed to fetch experience data');
      }
    } catch (error) {
      console.error('Error fetching experience data:', error);
      toast.error('Failed to load experience data');
    }
  };

  // CRUD operations
  const handleCreateExperience = async (data: Record<string, unknown>) => {
    try {
      // Handle image upload - base64 string or null
      const imageData = data.image as string || '/images/default-experience.jpg';

      const payload = {
        title: data.title,
        company: data.company,
        position: data.position,
        description: data.description,
        image: imageData,
        startDate: data.startDate,
        endDate: data.endDate || null,
        currentJob: data.currentJob || false,
        location: data.location,
        type: data.type || 'full-time',
        department: data.department || '',
        featured: data.featured || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order || experienceData.length + 1,
        tags: data.tags ? (data.tags as string[]).join(',') : '',
      };

      console.log('Creating experience with payload:', payload);

      const response = await fetch(`${API_BASE}/api/experience`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Create response:', result);
      
      if (result.success) {
        toast.success('Success', 'Experience created successfully');
        fetchExperienceData(currentPage, itemsPerPage);
        return true;
      } else {
        toast.error('Error', result.message || 'Failed to create experience');
        return false;
      }
    } catch (error) {
      console.error('Error creating experience:', error);
      toast.error('Error', 'Failed to create experience');
      return false;
    }
  };

  const handleUpdateExperience = async (id: string, data: Record<string, unknown>) => {
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        company: data.company,
        position: data.position,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || null,
        currentJob: data.currentJob,
        location: data.location,
        type: data.type,
        department: data.department,
        featured: data.featured,
        isActive: data.isActive,
        order: data.order,
        tags: data.tags ? (data.tags as string[]).join(',') : '',
      };

      // Only include image if it was updated (not null and not empty)
      if (data.image && data.image !== '' && data.image !== null) {
        payload.image = data.image;
      }

      console.log('Updating experience with payload:', payload);

      const response = await fetch(`${API_BASE}/api/experience/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update response:', result);
      
      if (result.success) {
        toast.success('Success', 'Experience updated successfully');
        fetchExperienceData(currentPage, itemsPerPage);
        return true;
      } else {
        toast.error('Error', result.message || 'Failed to update experience');
        return false;
      }
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error('Error', 'Failed to update experience');
      return false;
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/experience/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Success', 'Experience deleted successfully');
        fetchExperienceData(currentPage, itemsPerPage);
      } else {
        toast.error('Error', result.message || 'Failed to delete experience');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Error', 'Failed to delete experience');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchExperienceData(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    fetchExperienceData(1, limit);
  };

  useEffect(() => {
    fetchExperienceData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: Column[] = [
    { header: "Logo", accessor: "image", type: "image" },
    { header: "Position", accessor: "position", type: "text" },
    { header: "Company", accessor: "company", type: "text" },
    { header: "Location", accessor: "location", type: "text" },
    { header: "Type", accessor: "type", type: "text" },
    { header: "Featured", accessor: "featured", type: "text", render: (value) => value ? "✅ Yes" : "❌ No" },
    { header: "Active", accessor: "isActive", type: "text", render: (value) => value ? "✅ Yes" : "❌ No" },
    { header: "Action", accessor: "action", type: "action" },
  ];

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "title",
        label: "Title*",
        type: "text",
        placeholder: "e.g. Senior Travel Consultant",
      },
      {
        name: "company",
        label: "Company*",
        type: "text",
        placeholder: "Company name",
      },
      {
        name: "position",
        label: "Position*",
        type: "text",
        placeholder: "e.g. Senior Travel Consultant",
      },
      {
        name: "description",
        label: "Description*",
        type: "textarea",
        placeholder: "Job description and responsibilities",
      },
      {
        name: "image",
        label: "Company Logo",
        type: "image",
        multiple: false,
      },
      {
        name: "startDate",
        label: "Start Date*",
        type: "monthYear",
      },
      {
        name: "endDate",
        label: "End Date",
        type: "monthYear",
      },
      {
        name: "location",
        label: "Location*",
        type: "text",
        placeholder: "e.g. Jakarta, Indonesia",
      },
      {
        name: "type",
        label: "Employment Type",
        type: "select",
        options: [
          { value: "full-time", label: "Full Time" },
          { value: "part-time", label: "Part Time" },
          { value: "freelance", label: "Freelance" },
          { value: "internship", label: "Internship" },
          { value: "remote", label: "Remote" },
        ],
      },
      {
        name: "department",
        label: "Department",
        type: "text",
        placeholder: "e.g. Consulting, Engineering",
      },
      {
        name: "order",
        label: "Display Order",
        type: "number",
        placeholder: "Order in display",
      },
      {
        name: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "e.g. consulting, travel, management",
      },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
      <AdminSidebar
        active={activeMenu}
        landingActiveKey="experience"
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
        <AdminHeader title="Experience Management" />

        <div className="flex-1 overflow-y-auto space-y-10 pr-1">
          <section>
            <AdminTableHeader
              onAddClick={() => {
                setEditingId(null);
                setIsModalOpen(true);
              }}
              placeholder="Search experiences..."
            />

            <AdminTable
              columns={columns}
              data={experienceData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onEdit={(id) => {
                if (typeof id === "string") {
                  setEditingId(id);
                  setIsModalOpen(true);
                }
              }}
              onDelete={(id) => {
                if (typeof id === "string") {
                  handleDeleteExperience(id);
                }
              }}
            />
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Experience" : "Add Experience"}
        fields={modalFields}
        initialData={
          editingId != null
            ? experienceData.find((item) => item._id === editingId)
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={async (data) => {
          try {
            let success = false;
            if (editingId != null) {
              success = await handleUpdateExperience(editingId, data);
            } else {
              success = await handleCreateExperience(data);
            }

            if (success) {
              setIsModalOpen(false);
              setEditingId(null);
            }
          } catch (error) {
            console.error('Error saving experience:', error);
            toast.error('Error', 'Failed to save experience changes');
          }
        }}
      />
    </div>
  );
};

export default AdminExperiencePage;
