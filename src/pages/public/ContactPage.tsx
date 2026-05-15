import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

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

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'support@blockvote.io',
    description: 'Reach out to us anytime. We respond within 24 hours.',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    description: 'Monday - Friday, 9:00 AM - 6:00 PM EST',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: '123 Democracy Lane, Innovation City, 560001',
    description: 'Visit our headquarters for in-person consultations.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
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
            Contact Us
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have questions about BlockVote? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
          </motion.p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div {...fadeInUp} whileInView viewport={{ once: true }}>
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">
                  Send Us a Message
                </h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-success-600 dark:text-success-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-outline"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="input-field resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-6"
            >
              {contactInfo.map((info) => (
                <motion.div key={info.title} variants={fadeInUp}>
                  <div className="glass-card p-6 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-1">
                        {info.value}
                      </p>
                      <p className="text-dark-500 dark:text-dark-400 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Map Placeholder */}
              <motion.div variants={fadeInUp}>
                <div className="glass-card p-6 h-48 flex items-center justify-center bg-dark-100 dark:bg-dark-800">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-dark-400 dark:text-dark-500 mx-auto mb-2" />
                    <p className="text-dark-400 dark:text-dark-500 text-sm">
                      Interactive map coming soon
                    </p>
                    <p className="text-dark-400 dark:text-dark-500 text-xs mt-1">
                      123 Democracy Lane, Innovation City
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
