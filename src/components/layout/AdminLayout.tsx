import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  BarChart3,
  Megaphone,
  FileText,
  Link2,
  HelpCircle,
  Shield,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Settings,
  User,
  ChevronLeft,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Elections', icon: Vote, path: '/admin/elections' },
  { label: 'Candidates', icon: Users, path: '/admin/candidates' },
  { label: 'Voters', icon: UserCheck, path: '/admin/voters' },
  { label: 'Results', icon: BarChart3, path: '/admin/results' },
  { label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
  { label: 'Audit Logs', icon: FileText, path: '/admin/audit-logs' },
  { label: 'Blockchain Explorer', icon: Link2, path: '/admin/blockchain' },
  { label: 'Help', icon: HelpCircle, path: '/admin/help' },
];

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/elections': 'Elections',
  '/admin/candidates': 'Candidates',
  '/admin/voters': 'Voters',
  '/admin/results': 'Results',
  '/admin/announcements': 'Announcements',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/blockchain': 'Blockchain Explorer',
  '/admin/help': 'Help',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentPath = location.pathname;
  const pageTitle = pageTitles[currentPath] || 'Dashboard';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const renderSidebar = (mobile: boolean = false) => (
    <aside
      className={`${
        mobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-20'
      } flex flex-col bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 transition-all duration-300 h-full`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-200 dark:border-dark-700">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-500 flex-shrink-0" />
          {(sidebarOpen || mobile) && (
            <span className="text-lg font-bold gradient-text whitespace-nowrap">
              BlockVote
            </span>
          )}
        </Link>
        {/* Collapse button (desktop only) */}
        {!mobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={`w-4 h-4 text-dark-500 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
        {/* Close button (mobile only) */}
        {mobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-dark-500" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setMobileSidebarOpen(false)}
              className={`sidebar-item ${isActive ? 'active' : ''} ${
                !sidebarOpen && !mobile ? 'justify-center px-3' : ''
              }`}
              title={!sidebarOpen && !mobile ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">{renderSidebar()}</div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50">
            {renderSidebar(true)}
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 h-16 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-dark-600 dark:text-dark-300" />
            </button>

            <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-100 dark:bg-dark-700/50 text-dark-400 text-sm w-56">
              <Search className="w-4 h-4" />
              <span>Search...</span>
            </div>

            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
              <Bell className="w-5 h-5 text-dark-600 dark:text-dark-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Admin avatar with dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
              >
                <Avatar name={user?.name || 'Admin'} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-dark-700 dark:text-dark-200">
                  {user?.name || 'Admin'}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-lg py-1 z-50">
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="border-dark-200 dark:border-dark-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
