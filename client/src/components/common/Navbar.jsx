import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, ChevronDown, Briefcase, LayoutDashboard, Settings, LogOut, Shield, Home, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Get role-based navigation links
  const getNavLinks = () => {
    const commonLinks = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/jobs', label: 'Jobs', icon: Briefcase },
      { path: '/companies', label: 'Companies', icon: Users },
    ];

    if (!isAuthenticated) return commonLinks;

    const roleSpecificLinks = [];
    switch (user?.role) {
      case 'job_seeker':
        roleSpecificLinks.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
        break;
      case 'employer':
        roleSpecificLinks.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
        roleSpecificLinks.push({ path: '/post-job', label: 'Post Job', icon: Briefcase });
        break;
      case 'admin':
        roleSpecificLinks.push({ path: '/admin', label: 'Admin Panel', icon: Shield });
        roleSpecificLinks.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
        break;
      default:
        roleSpecificLinks.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    }
    return [...commonLinks, ...roleSpecificLinks];
  };

  // Get user dropdown items based on role
  const getUserDropdownItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/settings', label: 'Settings', icon: Settings },
    ];
    if (user?.role === 'employer') items.unshift({ path: '/post-job', label: 'Post a Job', icon: Briefcase });
    if (user?.role === 'admin') items.unshift({ path: '/admin', label: 'Admin Panel', icon: Shield });
    return items;
  };

  const navLinks = getNavLinks();
  const dropdownItems = getUserDropdownItems();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case 'employer': return 'bg-primary-100 text-primary-800';
      case 'admin': return 'bg-secondary-200 text-secondary-800';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  return (
    <>
      {/* Navbar - Sticky with backdrop blur */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 bg-clip-text text-transparent">
                  SmartHire
                </span>
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                        : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                // User Avatar with Dropdown
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-secondary-100 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-secondary-100">
                        <p className="text-sm font-semibold text-secondary-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-secondary-500 mt-0.5">{user?.email}</p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeClass()}`}>
                          {user?.role?.replace('_', ' ') || 'Member'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {dropdownItems.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                                isActive ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50'
                              }`
                            }
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-secondary-100 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Guest: Login & Register
                <div className="hidden md:flex items-center space-x-2">
                  <NavLink to="/login" className="px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm">
                    Register
                  </NavLink>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Drawer */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

        {/* Drawer Content */}
        <div className="relative w-80 max-w-[80%] h-full bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-secondary-900">SmartHire</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {isAuthenticated && (
            <div className="p-4 border-b border-secondary-100 bg-secondary-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getRoleBadgeClass()}`}>
                    {user?.role?.replace('_', ' ') || 'Member'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-secondary-50'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Auth Buttons (if not logged in) */}
          {!isAuthenticated && (
            <div className="p-4 border-t border-secondary-100 space-y-2">
              <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 text-base font-medium text-secondary-700 hover:text-primary-600">
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 text-base font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Register
              </NavLink>
            </div>
          )}

          {/* Logout Button (if logged in) */}
          {isAuthenticated && (
            <div className="p-4 border-t border-secondary-100">
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;