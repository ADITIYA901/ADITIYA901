import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OTPVerification from '../../components/ui/OTPVerification';
import PasswordStrength from '../../components/ui/PasswordStrength';

type Step = 'email' | 'otp' | 'new-password' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate API call for sending reset link
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP verified successfully');
      setStep('new-password');
    } catch (err: any) {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    toast.success('OTP resent to your email');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Password reset successfully!');
      setStep('success');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-dark-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 lg:p-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100">
                    Forgot Password?
                  </h2>
                  <p className="mt-2 text-dark-500 dark:text-dark-400">
                    Enter your email and we'll send you an OTP to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendResetLink} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/voter/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/30 mb-4">
                    <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100">
                    Verify OTP
                  </h2>
                  <p className="mt-2 text-dark-500 dark:text-dark-400">
                    We've sent a 6-digit code to{' '}
                    <span className="font-medium text-dark-700 dark:text-dark-300">
                      {email}
                    </span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OTPVerification
                    onVerify={handleOTPVerify}
                    onResend={handleResendOTP}
                    isLoading={isLoading}
                  />

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change email address
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: New Password */}
            {step === 'new-password' && (
              <motion.div
                key="new-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100">
                    Reset Password
                  </h2>
                  <p className="mt-2 text-dark-500 dark:text-dark-400">
                    Create a new password for your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      icon={<Lock className="w-5 h-5" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="focus:outline-none"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      }
                      required
                    />
                    <PasswordStrength password={newPassword} />
                  </div>

                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
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
                    error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
                    required
                  />

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={newPassword !== confirmPassword}
                    className="w-full"
                    size="lg"
                  >
                    Reset Password
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-success-600 dark:text-success-400" />
                </motion.div>

                <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                  Password Reset!
                </h2>
                <p className="text-dark-500 dark:text-dark-400 mb-8">
                  Your password has been successfully reset. You can now sign in with your new credentials.
                </p>

                <Link to="/voter/login">
                  <Button className="w-full" size="lg">
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
