import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, Briefcase, FileText, LogOut, Settings, Bookmark, Shield, LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSavedJobsContext } from '../contexts/SavedJobsContext';
import SettingsModal from './SettingsModal';
import logo from '../assets/logo.png';

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onCreateProfile: () => void;
  onMyProfile: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ darkMode, toggleDarkMode, onCreateProfile, onMyProfile, onSignUp, onSignIn }) => {
  const { user, logout } = useAuth();
  const { savedJobs } = useSavedJobsContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    if (showUserMenu || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, isMenuOpen]);

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMenuOpen(false);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu after navigation
      setIsMenuOpen(false);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUserMenu(false); // Close dropdown
    if (isAdmin || hasProfile) {
      onMyProfile();
    } else {
      onCreateProfile();
    }
  };

  const handleCreateProfileClick = () => {
    if (!user) {
      // User is not authenticated, show alert
      setShowAuthAlert(true);
      setTimeout(() => setShowAuthAlert(false), 4000); // Hide after 4 seconds
    } else {
      // User is authenticated, proceed with profile creation
      onCreateProfile();
    }
  };

  // Check if user has completed their profile
  const hasProfile = user && (
    user.hasProfile || 
    user.bio || 
    (user.skills && user.skills.length > 0) || 
    user.phone || 
    user.location
  );

  // Admin users don't need to create profiles
  const isAdmin = user && user.role === 'admin';

  interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon | null;
    onClick?: () => void;
    count?: number;
  }

  const guestMenuItems: MenuItem[] = [
    { name: 'Home', href: '#', icon: null, onClick: () => scrollToSection('top') },
    { name: 'Find Jobs', href: '#find-jobs', icon: Briefcase, onClick: () => scrollToSection('find-jobs') },
    { name: 'Career Advice', href: '#career-advice', icon: null, onClick: () => scrollToSection('career-advice') },
  ];

  const userMenuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/', icon: null },
    { name: 'Find Jobs', href: '#find-jobs', icon: Briefcase, onClick: () => scrollToSection('find-jobs') },
    { name: 'Career Advice', href: '#career-advice', icon: null, onClick: () => scrollToSection('career-advice') },
    { name: 'My Applications', href: '/my-applications', icon: FileText },
    { name: 'Saved Jobs', href: '/saved-jobs', icon: Bookmark, count: savedJobs?.length || 0 },
    
    ...(!hasProfile && !isAdmin ? [{ name: 'Create Profile', href: '#', icon: User, onClick: onCreateProfile }] : []),
  ];

  const menuItems = user ? userMenuItems : guestMenuItems;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        darkMode ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700' : 'bg-white/95 backdrop-blur-sm border-gray-200'
      } border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-0">
            <img 
              src={logo} 
              alt="JobQuest Logo" 
              className="h-24 w-auto object-contain"
            />
            <h1 className={`text-2xl font-bold -ml-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-blue-600">Job</span>
              <span className="text-teal-500">Quest</span>
            </h1>
          </div>

          {/* Desktop Menu - closer to logo */}
          <div className="hidden md:block ml-6 flex-1">
            <div className="flex items-center space-x-4">
              {menuItems.map((item) => {
                // Use Link for routes, anchor for scroll sections
                if (item.href.startsWith('/')) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
                      <span className="inline-block">{item.name}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                }
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    className={`flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
                    <span className="inline-block">{item.name}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        darkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                {console.log('👤 Navigation - Current user:', { 
                  name: `${user.firstName} ${user.lastName}`, 
                  email: user.email,
                  hasProfile: user.hasProfile 
                })}
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      darkMode 
                        ? 'text-white bg-gray-700/30 border-blue-500/30 shadow-lg shadow-blue-500/10 hover:bg-gray-600/40' 
                        : 'text-gray-900 bg-blue-50 border-blue-200 shadow-lg shadow-blue-100 hover:bg-blue-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.firstName}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="py-1">
                        <div className={`px-4 py-2 border-b ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {user.email}
                          </p>
                        </div>
                        
                        <a
                          href="#"
                          onClick={(e) => {
                            handleProfileClick(e);
                            setShowUserMenu(false);
                          }}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <User className="w-4 h-4 mr-3" />
                          {hasProfile || isAdmin ? 'My Profile' : 'Create Profile'}
                        </a>
                        
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex items-center px-4 py-2 text-sm transition-colors ${
                              darkMode 
                                ? 'text-blue-300 hover:bg-gray-700' 
                                : 'text-blue-700 hover:bg-gray-100'
                            }`}
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        
                        <button
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                            darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                            darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleCreateProfileClick}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  Create Profile
                </button>
                
                <button className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  darkMode 
                    ? 'text-gray-300 border border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={onSignIn}>
                  Sign In
                </button>
                
                <button 
                  onClick={onSignUp}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                  Sign Up
                </button>
              </>
            )}
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu buttons - positioned on the right */}
          <div className="md:hidden flex items-center space-x-2 ml-auto">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-80px)] overflow-y-auto">
              {menuItems.map((item) => {
                // Use Link for routes, anchor for scroll sections
                if (item.href.startsWith('/')) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />}
                      <span className="inline-block">{item.name}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                          darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                }
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />}
                    <span className="inline-block">{item.name}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                        darkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </a>
                );
              })}
              
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    {/* Mobile User Info */}
                    <div className={`px-4 py-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8" />
                        <div>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href="#"
                      onClick={handleProfileClick}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <User className="w-4 h-4 mr-3" />
                      {hasProfile || isAdmin ? 'My Profile' : 'Create Profile'}
                    </a>
                    
                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCreateProfileClick}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Create Profile
                    </button>
                    
                    <button className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                      darkMode 
                        ? 'text-gray-300 border border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-600 border border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={onSignIn}>
                      Sign In
                    </button>
                    
                    <button 
                      onClick={onSignUp}
                      className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
      
      {/* Authentication Required Alert */}
      {showAuthAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg border-l-4 border-blue-500 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          } max-w-md mx-4 relative`}>
            <button
              onClick={() => setShowAuthAlert(false)}
              className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start">
              <User className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1 pr-6">
                <p className="font-medium">Sign In Required</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Please sign in or create an account to create your profile.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowAuthAlert(false);
                      onSignIn();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthAlert(false);
                      onSignUp();
                    }}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      darkMode 
                        ? 'text-gray-300 border border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-600 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal - Rendered outside nav for proper z-index layering */}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
};

export default Navigation;