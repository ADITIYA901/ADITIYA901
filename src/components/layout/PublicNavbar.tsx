import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Contact', path: '/contact' },
  { label: 'FAQ', path: '/faq' },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold gradient-text">BlockVote</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-2 rounded-lg text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: ThemeToggle + buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/admin/login" className="btn-outline text-sm !px-4 !py-2">
            Admin Login
          </Link>
          <Link to="/voter/login" className="btn-primary text-sm !px-4 !py-2">
            Voter Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? (
            <X className="w-6 h-6 text-dark-600 dark:text-dark-300" />
          ) : (
            <Menu className="w-6 h-6 text-dark-600 dark:text-dark-300" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-200 dark:border-dark-700 pb-4">
          <div className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-dark-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 px-4 pt-4 border-t border-dark-200 dark:border-dark-700 mt-2">
            <ThemeToggle />
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="btn-outline text-sm !px-4 !py-2 flex-1 text-center"
            >
              Admin Login
            </Link>
            <Link
              to="/voter/login"
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-sm !px-4 !py-2 flex-1 text-center"
            >
              Voter Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
