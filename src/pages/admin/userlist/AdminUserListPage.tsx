import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminTable from "../../../components/admin/AdminTable";
import type { Column } from "../../../components/admin/AdminTable";
import AdminTableHeader from "../../../components/admin/AdminTableHeader";
import InitialShimmer from "../../../components/ui/InitialShimmer";
import { AdminTablePageSkeleton } from "../../../components/ui/skeletons";

interface UserItem extends Record<string, unknown> {
  id: string;
  username: string;
  email: string;
  role: string;
  displayName?: string;
  provider?: string;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
  profilePicture?: string;
}

const AdminUserListPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("users");
  const [userData, setUserData] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Check authentication on component mount and fetch users
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const token = localStorage.getItem('authToken');
    
    if (!isAuthenticated || !token) {
      console.log('❌ Not authenticated, redirecting to login...');
      navigate('/admin/login');
      return;
    }

    // If authenticated, fetch users
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
      console.log('🔑 Token value:', token);
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        console.log('❌ No token found, will redirect in 2 seconds...');
        setTimeout(() => {
          console.log('🔄 Redirecting to admin login...');
          navigate('/admin/login');
        }, 2000);
        return;
      }

      console.log('🌐 Fetching users from:', 'http://localhost:55435/api/admin/users');
      console.log('🌐 Using token:', token.substring(0, 20) + '...');
      
      const response = await fetch("http://localhost:55435/api/admin/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          setError('Authentication expired. Please login again.');
          setLoading(false);
          setTimeout(() => navigate('/admin/login'), 2000);
        } else {
          setError(errorData.message || 'Failed to fetch users');
          setLoading(false);
        }
        return;
      }
      
      const result = await response.json();
      console.log('✅ API Response:', result);

      if (typeof result !== "object" || result == null) {
        setError("Failed to fetch users");
        setLoading(false);
        return;
      }

      const payload = result as {
        success?: boolean;
        message?: string;
        data?: { users?: Record<string, unknown>[] };
      };

      if (payload.success) {
        const rawUsers = payload.data?.users ?? [];
        console.log('👥 Raw users count:', rawUsers.length);
        
        const mapped = rawUsers.map((user) => {
          return {
            ...(user as unknown as UserItem),
            id: user.id as string,
          };
        });

        console.log('🔄 Mapped users:', mapped);
        setUserData(mapped);
        setError(null);
        setLoading(false);
      } else {
        console.log('❌ API returned error:', payload.message);
        setError(payload.message || 'Failed to fetch users');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError("Error connecting to backend API");
      setLoading(false);
    }
  };

  const columns: Column[] = [
    { header: "Username", accessor: "username", type: "text" },
    { header: "Email", accessor: "email", type: "text" },
    { header: "Display Name", accessor: "displayName", type: "text" },
    { header: "Role", accessor: "role", type: "text" },
    { header: "Provider", accessor: "provider", type: "text" },
    { header: "Email Verified", accessor: "isEmailVerified", type: "text" },
    { header: "Last Login", accessor: "lastLogin", type: "text" },
    { header: "Created", accessor: "createdAt", type: "text" },
    { header: "Actions", accessor: "id", type: "action" },
  ];

  const handleShowResult = (user: UserItem) => {
    console.log('📄 Show result user clicked:', user);
    setSelectedUser(user);
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setSelectedUser(null);
  };

  const handlePreviewUser = (user: UserItem) => {
    console.log('🔍 Preview user clicked:', user);
    setSelectedUser(user);
    setShowResult(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:55435/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh users list
        fetchUsers();
        alert('✅ User deleted successfully!');
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user');
      console.error('Error deleting user:', err);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    console.log('📄 Page changed to:', page);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log('📊 Items per page changed to:', newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const totalPages = Math.ceil(userData.length / itemsPerPage);

  return (
    <InitialShimmer delayMs={850} skeleton={<AdminTablePageSkeleton titleWidthClassName="w-28" rows={6} />}>
      <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
        <AdminSidebar
          active={activeMenu}
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
          <AdminHeader title="User List" />

          <div className="flex-1 overflow-y-auto space-y-10 pr-1">
            <section>
              <AdminTableHeader
                placeholder="Search user..."
                addLabel=""
                rightSlot={
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                    title="Refresh users"
                  >
                    🔄 Refresh
                  </button>
                }
              />
              
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                  <p className="mt-2 text-slate-600">Loading users...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {!loading && !error && (
                <AdminTable
                  columns={columns}
                  data={userData.map(user => ({ ...user, _id: user.id }))}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onDelete={(id?: string) => id && handleDeleteUser(id)}
                  onPreview={(user) => handlePreviewUser(user as UserItem)}
                  onShowResult={(user) => handleShowResult(user as UserItem)}
                />
              )}
              
              {/* User Details Modal */}
              {showResult && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-slate-800">User Details</h3>
                      <button
                        onClick={handleCloseResult}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profile Section */}
                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-medium text-slate-700 mb-3">Profile Information</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              {selectedUser.profilePicture ? (
                                <img 
                                  src={selectedUser.profilePicture} 
                                  alt="Profile" 
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center ${selectedUser.profilePicture ? 'hidden' : ''}`}>
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{selectedUser.displayName || selectedUser.username || 'N/A'}</p>
                                <p className="text-sm text-slate-500">@{selectedUser.username || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Email:</span>
                                <span className="text-sm font-medium text-slate-800">{selectedUser.email || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Role:</span>
                                <span className="text-sm font-medium text-slate-800">{selectedUser.role || 'User'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Provider:</span>
                                <span className="text-sm font-medium text-slate-800">{selectedUser.provider || 'Local'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status & Activity Section */}
                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="font-medium text-slate-700 mb-3">Status & Activity</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Account Status:</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (selectedUser.isActive !== undefined ? selectedUser.isActive : true) 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {(selectedUser.isActive !== undefined ? selectedUser.isActive : true) ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Email Verified:</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                (selectedUser.isEmailVerified !== undefined ? selectedUser.isEmailVerified : false) 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(selectedUser.isEmailVerified !== undefined ? selectedUser.isEmailVerified : false) ? 'Verified' : 'Not Verified'}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm text-slate-600">Created:</span>
                                <p className="text-sm font-medium text-slate-800">
                                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-600">Last Login:</span>
                                <p className="text-sm font-medium text-slate-800">
                                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleCloseResult}
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </InitialShimmer>
  );
};

export default AdminUserListPage;
