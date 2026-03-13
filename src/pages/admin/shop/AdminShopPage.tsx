import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminModal, { type AdminModalField } from "../../../components/admin/AdminModal";
import { shopService, type ShopItem } from "../../../services/shopService";
import { useAdminToast } from "../../../hooks/useAdminToast";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

type AdminShopItem = ShopItem;

const AdminShopPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("shop");
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [items, setItems] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const inactiveItems = items.filter(item => item.status === 'inactive').length;
    const totalValue = items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      return sum + price;
    }, 0);

    return {
      totalItems,
      activeItems,
      inactiveItems,
      totalValue
    };
  }, [items]);

  // Load data from API
  const loadShopItems = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load shop items...');
      const result = await shopService.getShopItems({ status: 'all' }); // Get all items for admin
      console.log('📦 Shop items loaded from API:', result);
      console.log('📊 Data length:', result.data?.length || 0);
      console.log('📋 Data sample:', result.data?.[0]);
      console.log('📋 Data structure:', JSON.stringify(result.data?.[0], null, 2));
      console.log('📋 Data keys:', result.data?.[0] ? Object.keys(result.data[0]) : 'No data');
      setItems(result.data || []);
      console.log('✅ Items set in state:', result.data?.length || 0);
    } catch (error) {
      console.error('❌ Error loading shop items:', error);
      toast.error("Error", "Failed to load shop items");
    } finally {
      setLoading(false);
      console.log('🔄 Loading completed, loading state:', false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.serviceCategory ?? ""} ${item.price} ${item.deliveryTime ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
    console.log('🔍 Filtering items:', items.length, '->', filtered.length, 'for search:', q);
    return filtered;
  }, [items, search]);

  useEffect(() => {
    console.log('🔄 useEffect triggered, calling loadShopItems...');
    loadShopItems();
  }, []);

  useEffect(() => {
    console.log('📊 Items state changed:', items.length, 'items');
    console.log('📋 Items data:', items);
    console.log('🔍 Filtered items:', filteredItems.length, 'filteredItems');
    console.log('📋 Filtered items data:', filteredItems);
  }, [items, filteredItems]);

  useEffect(() => {
    console.log('🔄 Loading state changed:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('🎯 About to render - filteredItems:', filteredItems.length, 'items');
    console.log('📋 Filtered items data:', filteredItems);
  }, [filteredItems]);

  const columns: Column[] = useMemo(
    () => [
      {
        header: "Image",
        accessor: "imageSrc",
        type: "image",
      },
      {
        header: "Title",
        accessor: "title",
        type: "text",
        render: (value, row) => (
          <button
            type="button"
            onClick={() => setEditingId(row._id as string)}
            className="text-left text-[11px] text-slate-700 hover:text-blue-600"
          >
            {String(value)}
          </button>
        ),
      },
      { header: "Category", accessor: "serviceCategory", type: "text" },
      { header: "Price", accessor: "price", type: "text" },
      { header: "Delivery", accessor: "deliveryTime", type: "text" },
      {
        header: "Status",
        accessor: "status",
        type: "text",
        render: (value) => {
          const v = String(value);
          const isActive = v === "active";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      { header: "Action", accessor: "action", type: "action" },
    ],
    []
  );

  const modalFields: AdminModalField[] = useMemo(
    () => [
      {
        name: "imageSrc",
        label: "Product Image",
        type: "image",
        multiple: false,
      },
      {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Product title",
      },
      {
        name: "serviceCategory",
        label: "Category",
        type: "text",
        placeholder: "SEO Content / Blog Writing / ...",
      },
      {
        name: "price",
        label: "Base Price (e.g. $20)",
        type: "text",
        placeholder: "$20",
      },
      {
        name: "deliveryTime",
        label: "Delivery Time",
        type: "text",
        placeholder: "2 Days Delivery",
      },
      {
        name: "status",
        label: "Status (active / inactive)",
        type: "radio",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    []
  );

  const editingItem = useMemo(
    () => (editingId === null ? null : items.find((x) => x._id === editingId) ?? null),
    [editingId, items]
  );

  const normalizeImageValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      const first = value[0];
      return typeof first === "string" ? first : "/placeholder-image.png";
    }
    if (typeof value === "string" && value) return value;
    return "/placeholder-image.png";
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setSaving(true);
      console.log('Submitting form data:', data);
      
      const shopItemData: Partial<ShopItem> = {
        title: String(data.title ?? ""),
        imageSrc: normalizeImageValue(data.imageSrc),
        price: String(data.price ?? ""),
        deliveryTime: String(data.deliveryTime ?? ""),
        serviceCategory: String(data.serviceCategory ?? ""),
        status: (String(data.status ?? "active") === "inactive" ? "inactive" : "active") as "active" | "inactive",
      };

      console.log('Processed shop item data:', shopItemData);

      if (editingItem) {
        // Update existing item
        console.log('Updating existing item:', editingItem._id);
        const updatedItem = await shopService.updateShopItem(editingItem._id, shopItemData);
        console.log('Item updated successfully:', updatedItem);
        toast.success("Success", "Product updated successfully");
      } else {
        // Create new item
        console.log('Creating new item');
        const newItem = await shopService.createShopItem(shopItemData);
        console.log('Item created successfully:', newItem);
        toast.success("Success", "Product added successfully");
      }

      // Reload data with delay to ensure backend has processed
      console.log('🔄 Reloading shop items after save...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay
      console.log('🔄 Calling loadShopItems...');
      await loadShopItems();
      console.log('✅ LoadShopItems completed, items count:', items.length);
      
      setIsModalOpen(false);
      setEditingId(null);
      setSaving(false);
      
      // Force re-render
      console.log('🔄 Forcing re-render...');
      setTimeout(() => {
        console.log('🔄 Re-render triggered');
      }, 100);
    } catch (error) {
      console.error('❌ Error saving shop item:', error);
      setSaving(false);
      toast.error("Error", "Failed to save product changes");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      console.log('Deleting product:', id);
      setSaving(true);
      await shopService.deleteShopItem(id);
      toast.success("Success", "Product deleted successfully");
      await loadShopItems();
    } catch (error) {
      console.error('Error deleting shop item:', error);
      toast.error("Error", "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden overflow-x-hidden">
      <AdminSidebar
        active={activeMenu}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "dashboard") {
            navigate("/admin");
          } else if (key === "shop") {
            navigate("/admin/shop");
          } else if (key === "transactions") {
            navigate("/admin/transactions");
          } else if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "users") {
            navigate("/admin/users");
          } else {
            navigate("/");
          }
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading shop items...</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {/* Header Section */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Shop Management</h1>
                <p className="text-white text-lg">Manage your products and services</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{stats.totalItems}</span>
                  </div>
                  <p className="text-slate-600 text-sm">Total Products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{stats.activeItems}</span>
                  </div>
                  <p className="text-slate-600 text-sm">Active Products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{stats.inactiveItems}</span>
                  </div>
                  <p className="text-slate-600 text-sm">Inactive Products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">${stats.totalValue.toFixed(0)}</span>
                  </div>
                  <p className="text-slate-600 text-sm">Total Value</p>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all transform hover:scale-105 border border-blue-200"
                >
                  + Add Product
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-lg border border-blue-100">
                <AdminTable
                  columns={columns}
                  data={filteredItems as unknown as Record<string, unknown>[]}
                  currentPage={1}
                  itemsPerPage={50}
                  totalPages={1}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  onEdit={(id) => {
                    if (!id) return;
                    setEditingId(String(id));
                    setIsModalOpen(true);
                  }}
                  onDelete={(id) => {
                    if (!id) return;
                    handleDelete(String(id));
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingItem ? "Edit Product" : "Add Product"}
        fields={modalFields}
        initialData={
          editingItem
            ? {
                ...editingItem,
                imageSrc: editingItem.imageSrc,
              } as Record<string, unknown>
            : undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        isSaving={saving}
        submitLabel={saving ? "Saving..." : "Save"}
      />
    </div>
  );
};

export default AdminShopPage;
