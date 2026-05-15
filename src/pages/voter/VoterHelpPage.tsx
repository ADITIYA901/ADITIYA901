import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, ChevronDown, Vote, Wallet, Shield, Clock,
  CheckCircle2, AlertCircle, Send, MessageSquare, BookOpen,
  Download, Chrome, Puzzle, UserPlus, KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const faqItems = [
  {
    question: 'How do I register to vote?',
    answer: 'To register, click the "Sign Up" button on the login page. Fill in your name, email, Aadhaar number, and create a password. After registration, your identity will be verified by the system and an admin will approve your account before you can vote.',
  },
  {
    question: 'How do I connect my wallet?',
    answer: 'Go to your Profile page and click "Connect Wallet". If you have MetaMask installed, it will prompt you to connect. If not, the system will simulate a wallet connection for demo purposes. A connected wallet is required to cast votes on the blockchain.',
  },
  {
    question: 'Can I change my vote after casting it?',
    answer: 'No. Once a vote is cast and recorded on the blockchain, it cannot be changed or revoked. This is a fundamental property of blockchain technology that ensures vote integrity. Please review your selection carefully before confirming.',
  },
  {
    question: 'How do I know my vote was counted?',
    answer: 'After voting, you will receive a receipt containing the transaction hash and block number. You can view your voting history in the "My Votes" section, where all your past votes are listed with full blockchain verification details.',
  },
  {
    question: 'What does it mean to be "verified" and "approved"?',
    answer: '"Verified" means your identity has been confirmed through the Aadhaar verification process. "Approved" means an administrator has reviewed and approved your account for voting. Both statuses must be true before you can cast a vote.',
  },
  {
    question: 'When can I see election results?',
    answer: 'Election results are available only after an election has ended. You can check the "Election Results" page for completed elections. While an election is active, you can only see the candidates and cast your vote, not the current vote counts.',
  },
];

const votingSteps = [
  {
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Register',
    description: 'Create an account with your name, email, and Aadhaar number.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Get Verified',
    description: 'Wait for identity verification and admin approval.',
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: 'Connect Wallet',
    description: 'Link your MetaMask wallet or use the simulated connection.',
  },
  {
    icon: <Vote className="w-6 h-6" />,
    title: 'Select Election',
    description: 'Browse active elections and choose one to vote in.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Cast Vote',
    description: 'Select your candidate, confirm, and submit your vote on the blockchain.',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Get Receipt',
    description: 'Download your vote receipt with transaction hash and block number.',
  },
];

const metamaskSteps = [
  {
    icon: <Chrome className="w-6 h-6" />,
    title: 'Install MetaMask Extension',
    description: 'Visit metamask.io and click "Download" to install the MetaMask browser extension for Chrome, Firefox, Brave, or Edge.',
  },
  {
    icon: <KeyRound className="w-6 h-6" />,
    title: 'Create a Wallet',
    description: 'Open MetaMask and follow the setup wizard to create a new wallet. Set a strong password and securely store your seed phrase.',
  },
  {
    icon: <Puzzle className="w-6 h-6" />,
    title: 'Connect to BlockVote',
    description: 'Go to your Profile page in BlockVote and click "Connect Wallet". MetaMask will prompt you to approve the connection.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Start Voting',
    description: 'Once connected, your wallet address will be linked to your voter account and you can cast votes on the blockchain.',
  },
];

export default function VoterHelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  function toggleFaq(index: number) {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSending(true);
    try {
      // Simulate sending a support message
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent! We will get back to you soon.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Help & Support</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Everything you need to know about using BlockVote
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-500" /> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-dark-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-dark-400 shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaqIndex === index ? 'auto' : 0,
                    opacity: openFaqIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-dark-600 dark:text-dark-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Voting Guide */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
            <Vote className="w-5 h-5 text-success-500" /> Step-by-Step Voting Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {votingSteps.map((step, index) => (
              <div key={index} className="relative p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    {step.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary-500 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                      Step {index + 1}
                    </span>
                    <h3 className="font-semibold text-dark-900 dark:text-white">{step.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-dark-500 dark:text-dark-400">{step.description}</p>
                {index < votingSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-dark-300 dark:text-dark-600">
                    <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Wallet Setup Guide */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-500" /> Wallet Setup Guide (MetaMask)
          </h2>
          <div className="space-y-4">
            {metamaskSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <p className="text-sm text-primary-700 dark:text-primary-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Don't have MetaMask? The system can simulate a wallet connection for demo purposes.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Contact Support Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-warning-500" /> Contact Support
          </h2>
          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
            <Input
              label="Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your name"
              icon={<HelpCircle className="w-4 h-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              icon={<Send className="w-4 h-4" />}
              isLoading={isSending}
            >
              Send Message
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
