import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Check, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Captcha from '../../components/ui/Captcha';
import PasswordStrength from '../../components/ui/PasswordStrength';

export default function AdminSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error('Please complete the captcha verification');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signup({ email, password, name }, 'admin');
      toast.success('Admin account created successfully!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Secure admin access',
    'Real-time election monitoring',
    'Blockchain-verified results',
    'Comprehensive analytics',
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="gradient-bg flex-1 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 blockchain-grid opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center lg:text-left max-w-md"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            BlockVote Admin Portal
          </h1>
          <p className="text-white/70 text-lg mb-10">
            Join the network of administrators ensuring transparent and secure elections powered by blockchain technology.
          </p>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-lg">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100">
              Create Admin Account
            </h2>
            <p className="mt-2 text-dark-500 dark:text-dark-400">
              Register to manage elections on BlockVote
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@blockvote.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                required
              />
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Captcha Verification
              </label>
              <Captcha onVerify={setCaptchaVerified} />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!captchaVerified || password !== confirmPassword}
              className="w-full"
              size="lg"
            >
              Create Admin Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-dark-500 dark:text-dark-400">
            Already have an admin account?{' '}
            <Link
              to="/admin/login"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
