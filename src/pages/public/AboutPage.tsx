import { motion } from 'framer-motion';
import { Shield, Eye, Code, Server, Wallet, Target, Cpu } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

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

const techStack = [
  {
    icon: Cpu,
    name: 'Ethereum Smart Contracts',
    description:
      'Self-executing contracts on the Ethereum blockchain that handle vote recording, tallying, and verification with complete transparency.',
  },
  {
    icon: Code,
    name: 'React Frontend',
    description:
      'A modern, responsive interface built with React and TypeScript for seamless voter interaction across all devices.',
  },
  {
    icon: Server,
    name: 'Supabase Backend',
    description:
      'Scalable backend infrastructure providing authentication, real-time database, and storage capabilities.',
  },
  {
    icon: Wallet,
    name: 'MetaMask Integration',
    description:
      'Direct wallet connectivity for secure blockchain transactions, enabling voters to sign and submit votes verifiable on-chain.',
  },
];

const teamMembers = [
  { name: 'Alex Chen', role: 'Blockchain Architect', src: '' },
  { name: 'Sarah Johnson', role: 'Full-Stack Developer', src: '' },
  { name: 'Michael Park', role: 'Security Engineer', src: '' },
  { name: 'Emily Rodriguez', role: 'UX Designer', src: '' },
];

export default function AboutPage() {
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
            About BlockVote
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            BlockVote is a revolutionary platform that leverages blockchain technology
            to create transparent, secure, and verifiable elections for organizations
            and governments worldwide.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp}>
              <div className="glass-card p-8 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                  To democratize the electoral process by providing a secure, transparent,
                  and accessible voting platform that eliminates fraud, ensures voter privacy,
                  and delivers instant verifiable results. We believe every vote matters and
                  every voice deserves to be heard without compromise.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="glass-card p-8 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
                  Our Vision
                </h2>
                <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                  A world where elections are universally trusted, fully transparent, and
                  accessible to every eligible voter regardless of location or ability.
                  We envision blockchain technology as the foundation of democratic
                  integrity, restoring faith in electoral systems globally.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Technology <span className="gradient-text">Stack</span>
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Built with industry-leading technologies to ensure security, scalability, and reliability.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {techStack.map((tech) => (
              <motion.div key={tech.name} variants={fadeInUp}>
                <div className="glass-card p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <tech.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        {tech.name}
                      </h3>
                      <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">
                        {tech.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900 dark:text-white mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              A dedicated team of experts passionate about transforming democracy through technology.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {teamMembers.map((member) => (
              <motion.div key={member.name} variants={fadeInUp}>
                <div className="glass-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <Avatar name={member.name} size="xl" className="mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-500 dark:text-primary-400 font-medium">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 gradient-bg overflow-hidden relative">
        <div className="absolute inset-0 blockchain-grid" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp} whileInView viewport={{ once: true }}>
            <Shield className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Join the Movement
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Help us build a future where every vote is secure, transparent, and verifiable.
            </p>
            <a href="/contact" className="btn-outline !border-white/30 !text-white hover:!bg-white/10 text-lg px-8 py-4 inline-block">
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
