import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Briefcase, User, Bell, LogOut, Search, Bookmark, 
  PlusCircle, Shield, Check, X, ChevronDown, CheckCircle2,
  Menu, Users, FileText, Settings, Layers
} from 'lucide-react';
import GlobalCoLogo from '../GlobalCoLogo';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notificationApi';

export default function Navbar() {
  const { token, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (token) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    try {
      const [notes, count] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(notes || []);
      setUnreadCount(count || 0);
    } catch (e) {
      // quiet fail
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Normalized role string
  const userRole = role ? role.replace('ROLE_', '') : '';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/" className="flex items-center gap-2" aria-label="GlobalCo JobBoard Homepage">
            <GlobalCoLogo />
          </Link>

          {/* Primary Navigation Links (Tailored strictly by role) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600" aria-label="Main Navigation">
            
            {/* 1. GUEST Links (when not logged in) */}
            {!token && (
              <Link 
                to="/jobs" 
                className={`transition-colors py-1 border-b-2 ${
                  isActive('/jobs') ? 'text-primary border-primary font-semibold' : 'border-transparent hover:text-primary'
                }`}
              >
                Find Jobs
              </Link>
            )}

            {/* 2. CANDIDATE Exclusive Links */}
            {token && userRole === 'CANDIDATE' && (
              <>
                <Link 
                  to="/jobs" 
                  className={`transition-colors py-1 border-b-2 ${
                    isActive('/jobs') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  Find Jobs
                </Link>
                <Link 
                  to="/candidate/dashboard" 
                  className={`transition-colors py-1 border-b-2 ${
                    isActive('/candidate/dashboard') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/applications" 
                  className={`transition-colors py-1 border-b-2 ${
                    isActive('/applications') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  My Applications
                </Link>
                <Link 
                  to="/saved-jobs" 
                  className={`transition-colors py-1 border-b-2 ${
                    isActive('/saved-jobs') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  Saved Jobs
                </Link>
              </>
            )}

            {/* 3. RECRUITER Exclusive Links */}
            {token && userRole === 'RECRUITER' && (
              <>
                <Link 
                  to="/recruiter/dashboard" 
                  className={`transition-colors py-1 border-b-2 ${
                    isActive('/recruiter/dashboard') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  Hiring Hub
                </Link>
                <Link 
                  to="/recruiter/post-job" 
                  className={`transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                    isActive('/recruiter/post-job') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  <PlusCircle size={16} /> Post Opportunity
                </Link>
              </>
            )}

            {/* 4. ADMIN Exclusive Links */}
            {token && userRole === 'ADMIN' && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                    isActive('/admin/dashboard') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'
                  }`}
                >
                  <Shield size={16} /> Admin Console
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Unauthenticated Actions */}
          {!token && (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Authenticated Controls */}
          {token && (
            <div className="flex items-center gap-2">
              
              {/* Notification Center Popover */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    showNotifications 
                      ? 'bg-red-50 text-primary' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showNotifications && (
                  <div 
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                    role="region"
                    aria-label="Notifications List"
                  >
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">Notifications</h4>
                        <p className="text-[10px] text-slate-500">{unreadCount} unread</p>
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            className={`p-3 transition-colors flex items-start justify-between gap-2.5 ${
                              !n.isRead ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex-1">
                              <p className={`text-xs ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button 
                                onClick={(e) => handleMarkRead(n.id, e)}
                                className="p-1 text-primary hover:bg-red-100 rounded transition-colors"
                                title="Mark read"
                                aria-label="Mark notification read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Shortcut */}
              <Link 
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                title="View Profile"
                aria-label="User Profile"
              >
                <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {user?.username ? user.username[0].toUpperCase() : <User size={13} />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-none">
                    {user?.fullName || user?.username || 'Account'}
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider leading-none mt-1">
                    {userRole || 'USER'}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>

            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-dark hover:text-primary hover:bg-slate-50 rounded-xl transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-border-subtle px-6 py-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-3 font-extrabold text-sm text-dark">
            {/* Guest */}
            {!token && (
              <>
                <Link to="/jobs" className="py-2 hover:text-primary transition-colors">Find Jobs</Link>
                <Link to="/login" className="py-2 text-primary">Sign In</Link>
                <Link to="/register" className="py-2 text-primary">Register Free</Link>
              </>
            )}

            {/* Candidate */}
            {token && userRole === 'CANDIDATE' && (
              <>
                <Link to="/jobs" className="py-2 hover:text-primary transition-colors">Find Jobs</Link>
                <Link to="/candidate/dashboard" className="py-2 hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/applications" className="py-2 hover:text-primary transition-colors">My Applications</Link>
                <Link to="/saved-jobs" className="py-2 hover:text-primary transition-colors">Saved Jobs</Link>
                <Link to="/profile" className="py-2 hover:text-primary transition-colors">Candidate Profile</Link>
              </>
            )}

            {/* Recruiter */}
            {token && userRole === 'RECRUITER' && (
              <>
                <Link to="/recruiter/dashboard" className="py-2 hover:text-primary transition-colors">Hiring Hub</Link>
                <Link to="/recruiter/post-job" className="py-2 text-primary flex items-center gap-1.5">
                  <PlusCircle size={16} /> Post Opportunity
                </Link>
                <Link to="/profile" className="py-2 hover:text-primary transition-colors">Recruiter Profile</Link>
              </>
            )}

            {/* Admin */}
            {token && userRole === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className="py-2 text-primary flex items-center gap-1.5">
                  <Shield size={16} /> Admin Governance Console
                </Link>
              </>
            )}

            {token && (
              <button 
                onClick={onLogout}
                className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-red-600 text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
