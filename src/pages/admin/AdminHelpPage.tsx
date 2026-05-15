import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, ChevronDown, BookOpen, Code, FileCode, Send, Keyboard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I create a new election?',
    answer: 'Navigate to the Elections page from the sidebar and click "Create Election". Fill in the title, description, start date, and end date. Once created, you can add candidates to the election. Make sure the dates are set correctly as they determine when the election becomes active and when it ends.',
  },
  {
    question: 'How do I approve or reject voter registrations?',
    answer: 'Go to the Voter Management page. Voters with "Pending" status need your approval. Click the checkmark icon to approve or the X icon to reject. Approved voters will be able to cast votes in active elections. You can also view full voter details by clicking the eye icon.',
  },
  {
    question: 'How can I view election results?',
    answer: 'Navigate to the Results page and select an election from the dropdown. The page displays the winner, vote distribution charts (pie and bar), and a detailed results table. You can also export the results as a PDF document using the "Export PDF" button.',
  },
  {
    question: 'What is the Blockchain Explorer?',
    answer: 'The Blockchain Explorer allows you to browse all blockchain transactions (votes) recorded on the system. You can search by transaction hash, view block numbers, and see transaction details including gas used and timestamps. Click on any transaction to view the full receipt.',
  },
  {
    question: 'How do announcements work?',
    answer: 'Announcements let you notify voters about important updates. You can create announcements tied to a specific election or general announcements. Voters will see these announcements on their dashboard. Go to the Announcements page and click "Create Announcement" to get started.',
  },
  {
    question: 'Can I track system activity?',
    answer: 'Yes, the Audit Logs page records all system activities including logins, votes, election changes, and administrative actions. You can filter logs by date range, user type (Admin/Voter), and action type. Logs can also be exported as a CSV file for further analysis.',
  },
];

const quickLinks = [
  {
    title: 'Documentation',
    description: 'Complete guide for the BlockVote platform',
    icon: <BookOpen className="w-6 h-6" />,
    href: '#',
  },
  {
    title: 'API Reference',
    description: 'REST API endpoints and integration guide',
    icon: <Code className="w-6 h-6" />,
    href: '#',
  },
  {
    title: 'Smart Contract Guide',
    description: 'Solidity contracts and deployment guide',
    icon: <FileCode className="w-6 h-6" />,
    href: '#',
  },
];

const keyboardShortcuts = [
  { keys: 'Ctrl + N', description: 'Create new election' },
  { keys: 'Ctrl + K', description: 'Open search/command palette' },
  { keys: 'Ctrl + E', description: 'Go to elections page' },
  { keys: 'Ctrl + V', description: 'Go to voter management' },
  { keys: 'Ctrl + R', description: 'Go to results page' },
  { keys: 'Ctrl + ?', description: 'Open help page' },
  { keys: 'Escape', description: 'Close modal/dialog' },
];

export default function AdminHelpPage() {
  const { user } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function toggleFAQ(index: number) {
    setOpenFAQ(prev => (prev === index ? null : index));
  }

  function handleContactChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  function validateContactForm(): boolean {
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim()) errors.name = 'Name is required';
    if (!contactForm.email.trim()) errors.email = 'Email is required';
    if (!contactForm.message.trim()) errors.message = 'Message is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateContactForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate sending a support message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Support message sent successfully');
      setContactForm(prev => ({ ...prev, message: '' }));
      setFormErrors({});
    } catch (error) {
      console.error('Error sending support message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold gradient-text">Help & Support</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Find answers, documentation, and contact support
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                >
                  <span className="font-medium text-dark-900 dark:text-white text-sm">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-dark-500 transition-transform duration-200 shrink-0 ml-2 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map(link => (
            <a
              key={link.title}
              href={link.href}
              className="glass-card p-5 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  {link.icon}
                </div>
                <h3 className="font-semibold text-dark-900 dark:text-white">
                  {link.title}
                </h3>
              </div>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Keyboard Shortcuts */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Keyboard className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyboardShortcuts.map(shortcut => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50"
              >
                <span className="text-sm text-dark-700 dark:text-dark-300">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono font-semibold text-dark-900 dark:text-white bg-white dark:bg-dark-700 rounded-lg border border-dark-200 dark:border-dark-600 shadow-sm">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Contact Support Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Send className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Contact Support
            </h2>
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
            <Input
              label="Name"
              name="name"
              type="text"
              placeholder="Your name"
              value={contactForm.name}
              onChange={handleContactChange}
              error={formErrors.name}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Your email"
              value={contactForm.email}
              onChange={handleContactChange}
              error={formErrors.email}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Describe your issue or question..."
                value={contactForm.message}
                onChange={handleContactChange}
                className={formErrors.message ? 'input-field border-error-500 focus:ring-error-500/50 focus:border-error-500 resize-none' : 'input-field resize-none'}
                required
              />
              {formErrors.message && <p className="text-sm text-error-500">{formErrors.message}</p>}
            </div>

            <Button type="submit" isLoading={isSubmitting} icon={<Send className="w-4 h-4" />}>
              Send Message
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
