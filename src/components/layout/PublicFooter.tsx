import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

const resources = [
  { label: 'Voter Guide', path: '/resources/voter-guide' },
  { label: 'Blockchain Security', path: '/resources/blockchain-security' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms of Service', path: '/terms-of-service' },
  { label: 'API Documentation', path: '/resources/api-docs' },
];

export default function PublicFooter() {
  return (
    <footer className="bg-dark-900 dark:bg-dark-950 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About BlockVote */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">BlockVote</span>
            </div>
            <p className="text-sm text-dark-400 leading-relaxed">
              BlockVote is a blockchain-based voting system designed to ensure
              transparent, tamper-proof, and verifiable elections. Leveraging
              decentralized technology, we bring trust and integrity to the
              democratic process.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-dark-400">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                support@blockvote.io
              </li>
              <li className="flex items-center gap-2 text-sm text-dark-400">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-2 text-sm text-dark-400">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                123 Democracy Lane, Innovation City, 560001
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-dark-500">
            &copy; {new Date().getFullYear()} BlockVote. All rights reserved.
          </p>
          <p className="text-sm text-dark-500">
            Built with blockchain technology
          </p>
        </div>
      </div>
    </footer>
  );
}
