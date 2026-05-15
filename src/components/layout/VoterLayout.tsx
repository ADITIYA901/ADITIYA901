import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Menu,
  X,
  LayoutDashboard,
  Vote,
  CheckCircle,
  BarChart3,
  User,
  LogOut,
  Settings,
  Wallet,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';

const navLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/voter/dashboard' },
  { label: 'Elections', icon: Vote, path: '/voter/elections' },
  { label: 'My Votes', icon: CheckCircle, path: '/voter/my-votes' },
  { label: 'Results', icon: BarChart3, path: '/voter/results' },
  { label: 'Profile', icon: User, path: '/voter/profile' },
];

export default function VoterLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, account, connectWallet, isConnecting } = useBlockchain();

  const currentPath = location.pathname;

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
    navigate('/voter/login');
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch {
      // Wallet connection failure handled silently
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900">
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/voter/dashboard" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-500" />
            <span className="text-lg font-bold gradient-text">BlockVote</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || currentPath.startsWith(link.path + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Wallet connection status */}
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/50">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-xs font-medium text-success-700 dark:text-success-400">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                </span>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 text-xs font-medium text-warning-700 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors disabled:opacity-50"
              >
                <Wallet className="w-3.5 h-3.5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* User menu dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
              >
                <Avatar name={user?.name || 'Voter'} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-dark-700 dark:text-dark-200">
                  {user?.name || 'Voter'}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-lg py-1 z-50">
                  <Link
                    to="/voter/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/voter/settings"
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-dark-600 dark:text-dark-300" />
            ) : (
              <Menu className="w-6 h-6 text-dark-600 dark:text-dark-300" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-200 dark:border-dark-700 pb-4">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path || currentPath.startsWith(link.path + '/');
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700/50 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 px-4 pt-4 border-t border-dark-200 dark:border-dark-700 mt-3">
              <ThemeToggle />

              {/* Wallet status (mobile) */}
              {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/50">
                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                  <span className="text-xs font-medium text-success-700 dark:text-success-400">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 text-xs font-medium text-warning-700 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors disabled:opacity-50"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}

              {/* Profile and logout (mobile) */}
              <Link
                to="/voter/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
              >
                <Avatar name={user?.name || 'Voter'} size="sm" />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 rounded-xl hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5 text-error-500" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
