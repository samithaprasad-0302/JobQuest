import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import JobManagement from './JobManagement';
import AdminLogin from './AdminLogin';

interface AdminLayoutProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  console.log('🏢 AdminLayout - Current user:', user, 'Location:', location.pathname);

  // Show admin login if user is not authenticated or not an admin/super_admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    console.log('🏢 AdminLayout - Showing AdminLogin, user not authorized');
    return <AdminLogin />;
  }

  console.log('🏢 AdminLayout - User authorized, showing admin interface');

  // Get current view from URL path
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/jobs')) return 'jobs';
    if (path.includes('/admin/companies')) return 'companies';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'jobs', label: 'Job Management', icon: Briefcase, path: '/admin/jobs' },
    { id: 'companies', label: 'Company Management', icon: Building, path: '/admin/companies' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const renderContent = () => {
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard darkMode={darkMode} />} />
        <Route path="/dashboard" element={<AdminDashboard darkMode={darkMode} />} />
        <Route path="/users" element={<UserManagement darkMode={darkMode} />} />
        <Route path="/jobs" element={<JobManagement darkMode={darkMode} />} />
        <Route path="/companies" element={
          <div className={`text-center p-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Company Management</h3>
            <p>Coming Soon</p>
          </div>
        } />
        <Route path="/settings" element={
          <div className={`text-center p-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">System Settings</h3>
            <p>Coming Soon</p>
          </div>
        } />
      </Routes>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-30 h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and brand */}
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Admin Panel
              </span>
            </div>

            {/* Center - Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? darkMode
                          ? 'bg-blue-900 text-blue-200 border border-blue-700'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side - User info and controls */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Administrator
                  </p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`fixed top-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? darkMode
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-blue-100 text-blue-700'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content - adjusted for top navigation */}
      <div className="pt-16">
        <main className="p-4">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;