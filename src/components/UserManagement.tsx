import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { getUsers, updateUserStatus, updateUserRole, getAdminPermissions } from '../services/adminApi';
import GuestApplicationManagement from './GuestApplicationManagement';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'employer' | 'admin' | 'super_admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserManagementProps {
  darkMode: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Admin permissions state
  const [permissions, setPermissions] = useState({
    canChangeRoles: false,
    canManageUsers: false,
    canManageJobs: false,
    canManageCompanies: false
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'users' | 'guests'>('users');

  const tabs = [
    { 
      id: 'users' as const, 
      label: 'Registered Users', 
      icon: Users,
      count: totalUsers
    },
    { 
      id: 'guests' as const, 
      label: 'Guest Applications', 
      icon: UserPlus,
      count: 0 // Will be updated when guest stats are loaded
    }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        limit: 20
      };
      
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';

      const response = await getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.totalUsers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await getAdminPermissions();
      setPermissions(response.permissions);
    } catch (err) {
      console.error('Fetch permissions error:', err);
      // Set default permissions if fetch fails
      setPermissions({
        canChangeRoles: false,
        canManageUsers: true, // Default admin permission
        canManageJobs: true,
        canManageCompanies: true
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [currentPage, search, roleFilter, statusFilter]);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      // Find the user to check if it's a super admin
      const targetUser = users.find(u => u._id === userId);
      if (targetUser?.role === 'super_admin' && !permissions.canChangeRoles) {
        setError('Access denied. Cannot modify super administrator accounts.');
        return;
      }

      await updateUserStatus(userId, !currentStatus);
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Update user status error:', err);
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'employer' | 'admin' | 'super_admin') => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Update user role error:', err);
      setError(err.message || 'Failed to update user role');
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-1">
          <h1 className={`text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage platform users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    isActive
                      ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <>
          {/* Error Display for Users */}
          {error && (
            <div className={`p-4 rounded-lg border ${
              darkMode 
                ? 'bg-red-900/20 border-red-800 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* User Stats */}
          <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg w-fit">
            <Users className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              {totalUsers} total users
            </span>
          </div>

      {/* Filters Section */}
      <div className={`p-3 lg:p-4 rounded-lg border ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
            {permissions.canChangeRoles && <option value="super_admin">Super Admin</option>}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center justify-center ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-lg border overflow-hidden ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-3 lg:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  User
                </th>
                <th className={`px-3 lg:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Role
                </th>
                <th className={`px-3 lg:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`hidden lg:table-cell px-3 lg:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Joined
                </th>
                <th className={`px-3 lg:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((user) => (
                <tr key={user._id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-xs">
                          {user.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                    {permissions.canChangeRoles ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'employer' | 'admin' | 'super_admin')}
                        className={`text-sm px-2 py-1 rounded border min-w-[100px] ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                          : user.role === 'admin'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : user.role === 'employer'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' :
                         user.role === 'employer' ? 'Employer' : 'User'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.isActive)}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 lg:px-4 py-2 whitespace-nowrap">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {/* Only show status toggle if user can modify this account */}
                      {(permissions.canChangeRoles || user.role !== 'super_admin') ? (
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={`p-1 rounded transition-colors ${
                            user.isActive
                              ? darkMode
                                ? 'text-red-400 hover:bg-red-900/20'
                                : 'text-red-600 hover:bg-red-50'
                              : darkMode
                                ? 'text-green-400 hover:bg-green-900/20'
                                : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className={`p-1 rounded opacity-50 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} title="Cannot modify super admin accounts">
                          <UserX className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        className={`p-1 rounded transition-colors ${
                          darkMode
                            ? 'text-blue-400 hover:bg-blue-900/20'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 lg:px-4 py-3 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center sm:justify-start">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center text-sm ${
                currentPage === 1
                  ? darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded border transition-colors flex items-center text-sm ${
                currentPage === totalPages
                  ? darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Guest Applications Tab */
        <GuestApplicationManagement darkMode={darkMode} />
      )}
    </div>
  );
};

export default UserManagement;