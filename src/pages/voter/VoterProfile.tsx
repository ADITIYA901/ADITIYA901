import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, ShieldCheck, Wallet, Mail, Phone, CreditCard as Edit3, Lock, Save, Eye, EyeOff, Calendar, Vote, CheckCircle2, AlertCircle, Copy, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Avatar from '../../components/ui/Avatar';
import PasswordStrength from '../../components/ui/PasswordStrength';
import type { Voter } from '../../types';
import { formatDate, truncateAddress, copyToClipboard } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VoterProfile() {
  const { user, refreshUser } = useAuth();
  const { isConnected, account, connectWallet, disconnectWallet, isConnecting } = useBlockchain();

  const voter = user as Voter | null;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(voter?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    setIsLoading(true);
    try {
      if (voter) {
        const { count } = await supabase
          .from('votes')
          .select('id', { count: 'exact', head: true })
          .eq('voter_id', voter.id);
        setTotalVotes(count || 0);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnectWallet() {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
    } catch {
      toast.error('Failed to connect wallet');
    }
  }

  function handleDisconnectWallet() {
    disconnectWallet();
    toast.success('Wallet disconnected');
  }

  async function handleSaveProfile() {
    if (!voter || !editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('voters')
        .update({ name: editName.trim() })
        .eq('id', voter.id);

      if (error) throw error;

      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleCopyAddress() {
    if (account) {
      copyToClipboard(account);
      toast.success('Address copied to clipboard');
    }
  }

  function maskAadhaar(aadhaar: string): string {
    if (!aadhaar) return '--';
    const cleaned = aadhaar.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    return `XXXX XXXX ${cleaned.slice(-4)}`;
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading profile..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Profile</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Manage your account settings</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar src={undefined} name={voter?.name || 'Voter'} size="xl" />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">{voter?.name || 'Voter'}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Mail className="w-4 h-4" />
                <span>{voter?.email || '--'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Phone className="w-4 h-4" />
                <span>Aadhaar: {maskAadhaar(voter?.aadhaar_id || '')}</span>
              </div>
              {voter?.wallet_address && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-dark-500 dark:text-dark-400">
                  <Wallet className="w-4 h-4" />
                  <code className="text-xs font-mono">{truncateAddress(voter.wallet_address)}</code>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" icon={<Edit3 className="w-4 h-4" />} onClick={() => { setEditName(voter?.name || ''); setIsEditing(true); }}>
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Verification Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" /> Verification Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-dark-200 dark:border-dark-700 flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${voter?.is_verified ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'}`}>
                {voter?.is_verified ? (
                  <ShieldCheck className="w-5 h-5 text-success-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 dark:text-white">Identity Verification</p>
                <Badge variant={voter?.is_verified ? 'verified' : 'pending'} className="mt-1">
                  {voter?.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-dark-200 dark:border-dark-700 flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${voter?.is_approved ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'}`}>
                {voter?.is_approved ? (
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 dark:text-white">Admin Approval</p>
                <Badge variant={voter?.is_approved ? 'verified' : 'pending'} className="mt-1">
                  {voter?.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Wallet Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-500" /> Wallet
          </h3>
          {isConnected && account ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <p className="text-sm text-success-700 dark:text-success-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Wallet Connected
                </p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700 flex items-center gap-3">
                <code className="text-sm font-mono text-primary-600 dark:text-primary-400 flex-1 break-all">
                  {account}
                </code>
                <button onClick={handleCopyAddress} className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors shrink-0" title="Copy address">
                  <Copy className="w-4 h-4 text-dark-400" />
                </button>
              </div>
              <Button variant="danger" size="sm" icon={<Wallet className="w-4 h-4" />} onClick={handleDisconnectWallet}>
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-sm text-warning-700 dark:text-warning-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No wallet connected
                </p>
              </div>
              <Button
                variant="primary"
                icon={<Wallet className="w-5 h-5" />}
                onClick={handleConnectWallet}
                isLoading={isConnecting}
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Edit Profile Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" /> Edit Profile
          </h3>
          <div className="space-y-4 max-w-md">
            <Input
              label="Full Name"
              value={isEditing ? editName : (voter?.name || '')}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!isEditing}
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email"
              value={voter?.email || ''}
              disabled
              icon={<Mail className="w-4 h-4" />}
            />
            <p className="text-xs text-dark-400 dark:text-dark-500">Email cannot be changed. Contact support if you need to update it.</p>
            {isEditing && (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Change Password Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-error-500" /> Change Password
          </h3>
          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Key className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="focus:outline-none">
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <div>
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="focus:outline-none">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <PasswordStrength password={newPassword} />
            </div>
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<Lock className="w-4 h-4" />}
              onClick={handleChangePassword}
              isLoading={isChangingPassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              Change Password
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-warning-500" /> Account Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
              <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="text-lg font-semibold text-dark-900 dark:text-white">
                {voter?.created_at ? formatDate(voter.created_at) : '--'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
              <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 mb-1">
                <Vote className="w-4 h-4" />
                <span className="text-sm">Total Votes Cast</span>
              </div>
              <p className="text-lg font-semibold text-dark-900 dark:text-white">{totalVotes}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
