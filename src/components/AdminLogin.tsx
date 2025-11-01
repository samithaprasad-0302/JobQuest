import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Check for dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log('🔐 AdminLogin - useEffect triggered, user:', user, 'isLoading:', isLoading);
    
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      console.log('🔐 AdminLogin - Valid admin/super_admin user, redirecting to dashboard');
      console.log('🔐 AdminLogin - About to navigate to /admin/dashboard');
      navigate('/admin/dashboard');
      console.log('🔐 AdminLogin - Navigate called successfully');
    } else if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      // Check if user just logged in but is not admin
      if (user && isLoading === false) {
        console.log('🔐 AdminLogin - Invalid role for admin access:', user.role);
        setError('Access denied. Administrator privileges required.');
      }
    }
  }, [user, navigate, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 AdminLogin - Attempting login with:', formData.email);
      
      // Attempt login
      await login(formData.email, formData.password);
      
      console.log('🔐 AdminLogin - Login successful, waiting for user state update');
      // The useEffect hook will handle the redirect and admin check once user state is updated
      
    } catch (err: any) {
      console.error('🔐 AdminLogin - Login error:', err);
      if (err.message.includes('Invalid credentials')) {
        setError('Invalid administrator credentials. Please check your email and password.');
      } else if (err.message.includes('not found')) {
        setError('Administrator account not found.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-gray-900' 
            : 'bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50'
        }`}>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 ${
              darkMode ? 'bg-blue-600' : 'bg-blue-400'
            } blur-3xl`}></div>
            <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 ${
              darkMode ? 'bg-cyan-600' : 'bg-cyan-400'
            } blur-3xl`}></div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Dark Mode Toggle */}
        <div className="absolute top-0 right-0 -mt-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Admin Login Card */}
        <div className={`relative backdrop-blur-sm rounded-2xl shadow-2xl border overflow-hidden ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-white/20'
        }`}>
          {/* Header */}
          <div className={`px-8 py-6 text-center ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-600'
          }`}>
            <div className="flex items-center justify-center mb-3">
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-blue-600/20' : 'bg-white/20'
              }`}>
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Administrator Login
            </h1>
            <p className="text-blue-100 text-sm">
              Secure access to admin panel
            </p>
          </div>

          {/* Login Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
                  darkMode 
                    ? 'bg-red-900/20 border-red-800 text-red-300' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`w-5 h-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="admin@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your secure password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-blue-500'
                } focus:ring-2 focus:ring-offset-2`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Access Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className={`mt-6 p-4 rounded-lg ${
              darkMode 
                ? 'bg-gray-700/50 border border-gray-600' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start space-x-2">
                <Shield className={`w-4 h-4 mt-0.5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-xs font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Security Notice
                  </p>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    This is a secure administrator portal. All login attempts are monitored and logged.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Main Site */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className={`text-sm transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ← Back to main site
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            JobQuest Admin Portal © 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;