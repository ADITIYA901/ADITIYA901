import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Check, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Captcha from '../../components/ui/Captcha';
import PasswordStrength from '../../components/ui/PasswordStrength';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, 'admin');
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
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
            Manage elections, verify results, and oversee the democratic process with blockchain-powered transparency.
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100">
              Welcome Back
            </h2>
            <p className="mt-2 text-dark-500 dark:text-dark-400">
              Sign in to access the admin portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@blockvote.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

            {password && <PasswordStrength password={password} />}

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Captcha Verification
              </label>
              <Captcha onVerify={setCaptchaVerified} />
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!captchaVerified}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-dark-500 dark:text-dark-400">
            Don't have an admin account?{' '}
            <Link
              to="/admin/signup"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Create one here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
