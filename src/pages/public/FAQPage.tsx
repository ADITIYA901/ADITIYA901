import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Shield,
  Vote,
  Blocks,
  MessageCircle,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'general',
    title: 'General',
    icon: HelpCircle,
    items: [
      {
        question: 'What is BlockVote?',
        answer:
          'BlockVote is a blockchain-based voting platform that enables secure, transparent, and tamper-proof elections. By leveraging Ethereum smart contracts, we ensure every vote is permanently recorded and publicly verifiable.',
      },
      {
        question: 'Who can use BlockVote?',
        answer:
          'BlockVote is designed for organizations, institutions, and governments that want to conduct secure elections. Any eligible voter can participate once an election is created by an administrator.',
      },
      {
        question: 'Is BlockVote free to use?',
        answer:
          'BlockVote offers different plans depending on the scale of your elections. Small organizations can run basic elections for free. Enterprise plans with advanced features and higher capacity are available for larger organizations.',
      },
      {
        question: 'What devices can I use to vote?',
        answer:
          'BlockVote works on any device with a modern web browser and internet connection, including desktops, laptops, tablets, and smartphones. For blockchain interaction, you will need a MetaMask-compatible wallet installed.',
      },
    ],
  },
  {
    id: 'voting',
    title: 'Voting',
    icon: Vote,
    items: [
      {
        question: 'How do I cast my vote?',
        answer:
          'After registering and verifying your identity, connect your MetaMask wallet, browse available elections, select your choice, and sign the transaction. Your vote is encrypted and recorded on the blockchain within seconds.',
      },
      {
        question: 'Can I change my vote after submitting?',
        answer:
          'No. Once a vote is submitted and confirmed on the blockchain, it becomes immutable. This is a core feature of blockchain technology that ensures election integrity and prevents vote manipulation.',
      },
      {
        question: 'How long does voting take?',
        answer:
          'The actual voting process takes less than a minute. First-time voters should allow 5-10 minutes for registration and identity verification. Returning voters can vote in under 2 minutes.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    items: [
      {
        question: 'How is my vote kept private?',
        answer:
          'BlockVote uses zero-knowledge proof technology and end-to-end encryption. Your vote is encrypted before being submitted, and the decryption key is only available to authorized tallying authorities. No one, including BlockVote, can see your individual vote.',
      },
      {
        question: 'What prevents someone from voting twice?',
        answer:
          'Our system uses advanced duplicate vote prevention that combines blockchain identity verification, biometric checks, and smart contract logic. Each wallet address can only cast one vote per election, enforced at the contract level.',
      },
      {
        question: 'What happens if there is a security breach?',
        answer:
          'BlockVote is built on decentralized blockchain technology, meaning there is no single point of failure. Even if one component is compromised, the blockchain ledger remains tamper-proof. We also conduct regular security audits by third-party firms.',
      },
      {
        question: 'Is my personal data safe?',
        answer:
          'Absolutely. We use industry-standard encryption for all personal data. Biometric data is stored as cryptographic hashes that cannot be reverse-engineered. We comply with GDPR and other major privacy regulations.',
      },
    ],
  },
  {
    id: 'blockchain',
    title: 'Blockchain',
    icon: Blocks,
    items: [
      {
        question: 'Which blockchain does BlockVote use?',
        answer:
          'BlockVote currently operates on the Ethereum blockchain. We chose Ethereum for its robust smart contract capabilities, widespread adoption, and strong security track record. We are exploring Layer 2 solutions for reduced gas fees.',
      },
      {
        question: 'Do I need to pay gas fees to vote?',
        answer:
          'BlockVote covers gas fees for voters in most election configurations. Voters do not need to hold ETH to participate. In some enterprise configurations, the election organizer pays for all transaction costs.',
      },
      {
        question: 'Can I verify the election results independently?',
        answer:
          'Yes. All election results are derived from on-chain data that is publicly verifiable. You can use any blockchain explorer to audit the results, or use our built-in verification tools to cross-check the tally.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});

  const toggleItem = (categoryId: string, index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === index ? null : index,
    }));
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 gradient-bg overflow-hidden">
        <div className="absolute inset-0 blockchain-grid" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            {...fadeInUp}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find answers to common questions about BlockVote, our voting process,
            security measures, and blockchain technology.
          </motion.p>
        </div>
      </section>

      {/* Search & FAQ Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <motion.div
            className="mb-12"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 !py-4 text-base"
              />
            </div>
          </motion.div>

          {/* FAQ Categories */}
          <motion.div
            className="space-y-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
          >
            {filteredCategories.map((category) => (
              <motion.div key={category.id} variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.items.map((item, index) => (
                    <div key={index} className="glass-card overflow-hidden">
                      <button
                        onClick={() => toggleItem(category.id, index)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="font-medium text-dark-900 dark:text-white pr-4">
                          {item.question}
                        </span>
                        {openItems[category.id] === index ? (
                          <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0" />
                        )}
                      </button>
                      {openItems[category.id] === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5"
                        >
                          <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No results message */}
          {filteredCategories.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
              <p className="text-dark-500 dark:text-dark-400">
                No questions match your search. Try a different query.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp} whileInView viewport={{ once: true }}>
            <MessageCircle className="w-16 h-16 text-primary-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Still Have <span className="gradient-text">Questions</span>?
            </h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-xl mx-auto">
              Our team is here to help. Reach out to us and we'll get back to you
              as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Contact Us
              </Link>
              <Link to="/how-it-works" className="btn-outline text-lg px-8 py-4">
                How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
