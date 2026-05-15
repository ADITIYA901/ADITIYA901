import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Zap,
  Globe,
  Link2,
  Wallet,
  Vote,
  FileCheck,
  ChevronDown,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const features = [
  {
    icon: Shield,
    title: 'Immutable Records',
    description: 'Every vote is permanently recorded on the blockchain',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'Votes are encrypted before being stored',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    description: 'Public ledger for complete auditability',
  },
  {
    icon: UserCheck,
    title: 'One Person, One Vote',
    description: 'Advanced duplicate vote prevention',
  },
  {
    icon: Zap,
    title: 'Real-Time Results',
    description: 'Live vote counting and instant result generation',
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description: 'Vote from anywhere with internet access',
  },
];

const steps = [
  {
    icon: UserCheck,
    title: 'Register & Verify',
    description: 'Create your account and verify your identity',
  },
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Link your MetaMask wallet for blockchain interaction',
  },
  {
    icon: Vote,
    title: 'Cast Your Vote',
    description: 'Select your candidate and submit your encrypted vote',
  },
  {
    icon: FileCheck,
    title: 'Verify Receipt',
    description: 'Receive blockchain-verified transaction receipt',
  },
];

const stats = [
  { value: 10, suffix: 'M+', label: 'Votes Secured' },
  { value: 500, suffix: '+', label: 'Elections Conducted' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 100, suffix: '%', label: 'Transparency' },
];

function AnimatedCounter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(parseFloat(current.toFixed(decimals)));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated, decimals]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold text-white">
      {count.toFixed(decimals)}
      {suffix}
    </div>
  );
}

export default function HomePage() {
  const learnMoreRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
        <div className="absolute inset-0 blockchain-grid" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Blockchain Chain Graphic */}
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="flex items-center" variants={fadeInUp}>
                <motion.div
                  className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                >
                  <Shield className="w-7 h-7 md:w-10 md:h-10 text-white" />
                </motion.div>
                {i < 2 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.2 + 0.3 }}
                    className="mx-1 md:mx-2"
                  >
                    <Link2 className="w-5 h-5 md:w-7 md:h-7 text-white/70" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-extrabold gradient-text mb-6"
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Transform Democracy with Blockchain
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Secure, transparent, and tamper-proof elections powered by Ethereum smart contracts
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link to="/voter/login" className="btn-primary text-lg px-8 py-4">
              Start Voting
            </Link>
            <button
              onClick={scrollToFeatures}
              className="btn-outline !border-white/30 !text-white hover:!bg-white/10 text-lg px-8 py-4"
            >
              Learn More
              <ChevronDown className="w-5 h-5 ml-2 inline-block" />
            </button>
          </motion.div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-16 w-2 h-2 bg-accent-400/30 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-primary-300/20 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white/25 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-accent-500/20 rounded-full animate-pulse" />
        </div>
      </section>

      {/* Features Section */}
      <section ref={learnMoreRef} className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Why <span className="gradient-text">BlockVote</span>?
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge blockchain technology with user-friendly design
              to deliver the most secure and transparent voting experience.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <div className="glass-card p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-500 dark:text-dark-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Four simple steps to participate in a secure, blockchain-verified election.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, index) => (
              <motion.div key={step.title} variants={fadeInUp} className="relative">
                <div className="glass-card p-6 text-center h-full relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-primary-500 mb-2 uppercase tracking-wider">
                    Step {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-dark-500 dark:text-dark-400 text-sm">
                    {step.description}
                  </p>
                </div>
                {/* Chain link between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                    <Link2 className="w-6 h-6 text-primary-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.value === 99.9 ? 1 : 0}
                />
                <p className="text-dark-400 mt-2 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp} whileInView viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Ready to Experience the <span className="gradient-text">Future of Voting</span>?
            </h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-xl mx-auto">
              Join thousands of organizations already using BlockVote for secure, transparent elections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin/login" className="btn-secondary text-lg px-8 py-4">
                Admin Portal
              </Link>
              <Link to="/voter/login" className="btn-primary text-lg px-8 py-4">
                Voter Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
