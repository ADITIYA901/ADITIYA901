import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Shield,
  Wallet,
  Search,
  Vote,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const steps = [
  {
    icon: UserCheck,
    title: 'Voter Registration',
    description:
      'Create your BlockVote account by providing your basic information. Our system ensures only eligible voters can register by cross-referencing official records. You will receive a unique voter ID upon successful registration.',
    detail: 'The registration process uses multi-factor identity verification to prevent unauthorized accounts while maintaining voter privacy.',
  },
  {
    icon: Shield,
    title: 'Identity Verification',
    description:
      'Complete a secure identity verification process using government-issued ID and biometric checks. This step ensures the integrity of the election by confirming each voter is who they claim to be.',
    detail: 'All identity data is encrypted and stored securely. We never store raw biometric data -- only cryptographic hashes that cannot be reverse-engineered.',
  },
  {
    icon: Wallet,
    title: 'Wallet Connection',
    description:
      'Link your MetaMask or compatible Web3 wallet to your BlockVote account. This wallet serves as your digital signature tool, enabling you to cryptographically sign and submit your vote on the blockchain.',
    detail: 'Wallet connection uses secure OAuth-like protocols. Your private keys never leave your wallet -- BlockVote only requests signature authorization for vote transactions.',
  },
  {
    icon: Search,
    title: 'Browse Elections',
    description:
      'Explore active and upcoming elections. View detailed information about each election including candidates, proposals, voting periods, and real-time participation statistics.',
    detail: 'The election browser provides comprehensive filtering and search capabilities, allowing you to quickly find relevant elections and review all materials before casting your vote.',
  },
  {
    icon: Vote,
    title: 'Cast Vote',
    description:
      'Select your preferred candidate or option and submit your encrypted vote. Your vote is cryptographically secured and recorded as a blockchain transaction, ensuring it cannot be altered or deleted.',
    detail: 'Votes use zero-knowledge proof technology to maintain absolute voter privacy while still allowing public verification of the election results.',
  },
  {
    icon: FileCheck,
    title: 'Verify Receipt',
    description:
      'After voting, you receive a unique blockchain transaction receipt. This receipt allows you to independently verify that your vote was recorded correctly on the blockchain without revealing your vote choice.',
    detail: 'The receipt includes a transaction hash, block number, and timestamp. You can verify it on any blockchain explorer at any time, even after the election concludes.',
  },
];

const faqItems = [
  {
    question: 'How long does the entire voting process take?',
    answer:
      'The complete process from registration to vote verification typically takes 5-10 minutes for first-time voters. Returning voters can cast their vote in under 2 minutes since registration and verification are already complete.',
  },
  {
    question: 'Do I need to be tech-savvy to use BlockVote?',
    answer:
      'Not at all. BlockVote is designed with simplicity in mind. Our interface guides you through each step with clear instructions. The MetaMask wallet setup is the most technical step, and we provide detailed tutorials and support to help you through it.',
  },
  {
    question: 'Can I change my vote after submitting it?',
    answer:
      'Once a vote is submitted and confirmed on the blockchain, it cannot be changed. This immutability is a core feature of blockchain technology that ensures election integrity. However, you can verify that your vote was recorded correctly using your receipt.',
  },
  {
    question: 'What happens if I lose my transaction receipt?',
    answer:
      'Your vote is still recorded on the blockchain even if you lose the receipt. You can look up your transaction using your wallet address on any blockchain explorer. We also store a secure reference in your BlockVote account for easy access.',
  },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
            How It Works
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A step-by-step guide to participating in secure, blockchain-verified elections.
            From registration to verification, the entire process is designed to be simple
            and transparent.
          </motion.p>
        </div>
      </section>

      {/* Detailed Steps Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
          >
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div key={step.title} variants={fadeInUp}>
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {/* Left side: content or icon depending on index */}
                    <div className={`w-full md:w-1/2 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
                      {isLeft ? (
                        <div className="glass-card p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-dark-500 dark:text-dark-400 leading-relaxed mb-3">
                            {step.description}
                          </p>
                          <p className="text-sm text-dark-400 dark:text-dark-500 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
                            <step.icon className="w-14 h-14 md:w-18 md:h-18 text-primary-500" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visual indicator / connector */}
                    <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30" />
                    </div>

                    {/* Right side: icon or content depending on index */}
                    <div className={`w-full md:w-1/2 ${isLeft ? 'md:order-3' : 'md:order-1'}`}>
                      {!isLeft ? (
                        <div className="glass-card p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-dark-500 dark:text-dark-400 leading-relaxed mb-3">
                            {step.description}
                          </p>
                          <p className="text-sm text-dark-400 dark:text-dark-500 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
                            <step.icon className="w-14 h-14 md:w-18 md:h-18 text-primary-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-dark-500 dark:text-dark-400">
              Common questions about the voting process.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {faqItems.map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-dark-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
