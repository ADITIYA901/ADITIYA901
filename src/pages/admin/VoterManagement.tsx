import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, XCircle, Eye, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/ui/Card';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import type { Voter } from '../../types';
import { formatDate, formatDateTime, truncateAddress } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type FilterTab = 'all' | 'pending' | 'verified' | 'rejected';

function maskAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\s/g, '');
  if (cleaned.length < 12) return aadhaar;
  const last4 = cleaned.slice(-4);
  return `XXXX XXXX XXXX ${last4}`;
}

function getVoterStatus(voter: Voter): 'verified' | 'pending' | 'rejected' {
  if (voter.is_approved && voter.is_verified) return 'verified';
  if (voter.is_rejected) return 'rejected';
  return 'pending';
}

function getVotingStatusText(voter: Voter): string {
  if (voter.is_approved && voter.is_verified) return 'Eligible';
  if (voter.is_rejected) return 'Rejected';
  return 'Pending';
}

export default function VoterManagement() {
  const { user } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; voter: Voter | null }>({
    open: false,
    voter: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchVoters();
  }, []);

  async function fetchVoters() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoters((data as Voter[]) || []);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast.error('Failed to load voters');
    } finally {
      setIsLoading(false);
    }
  }

  async function approveVoter(voter: Voter) {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('voters')
        .update({ is_approved: true, is_verified: true })
        .eq('id', voter.id);
      if (error) throw error;
      toast.success(`${voter.name} has been approved`);
      setVoters(prev =>
        prev.map(v => (v.id === voter.id ? { ...v, is_approved: true, is_verified: true } : v))
      );
    } catch (error) {
      console.error('Error approving voter:', error);
      toast.error('Failed to approve voter');
    } finally {
      setIsUpdating(false);
    }
  }

  async function rejectVoter(voter: Voter) {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('voters')
        .update({ is_rejected: true, is_approved: false, is_verified: false })
        .eq('id', voter.id);
      if (error) throw error;
      toast.success(`${voter.name} has been rejected`);
      setVoters(prev =>
        prev.map(v => (v.id === voter.id ? { ...v, is_rejected: true, is_approved: false, is_verified: false } : v))
      );
    } catch (error) {
      console.error('Error rejecting voter:', error);
      toast.error('Failed to reject voter');
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredVoters = useMemo(() => {
    let result = voters;

    if (activeTab !== 'all') {
      result = result.filter(v => {
        const status = getVoterStatus(v);
        return status === activeTab;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v =>
          v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [voters, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const verified = voters.filter(v => getVoterStatus(v) === 'verified').length;
    const pending = voters.filter(v => getVoterStatus(v) === 'pending').length;
    const rejected = voters.filter(v => getVoterStatus(v) === 'rejected').length;
    return { total: voters.length, verified, pending, rejected };
  }, [voters]);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'verified', label: 'Verified', count: stats.verified },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (voter: Voter) => (
        <div className="flex items-center gap-3">
          <Avatar name={voter.name} size="sm" />
          <span className="font-medium text-dark-900 dark:text-white">{voter.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (voter: Voter) => (
        <span className="text-dark-700 dark:text-dark-300">{voter.email}</span>
      ),
    },
    {
      key: 'aadhaar_id',
      label: 'Aadhaar ID',
      render: (voter: Voter) => (
        <span className="font-mono text-sm text-dark-700 dark:text-dark-300">
          {maskAadhaar(voter.aadhaar_id)}
        </span>
      ),
    },
    {
      key: 'wallet_address',
      label: 'Wallet Address',
      render: (voter: Voter) => (
        <span className="font-mono text-sm text-dark-700 dark:text-dark-300">
          {voter.wallet_address ? truncateAddress(voter.wallet_address) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (voter: Voter) => {
        const status = getVoterStatus(voter);
        const variant = status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending';
        const label = status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'voting_status',
      label: 'Voting Status',
      render: (voter: Voter) => {
        const text = getVotingStatusText(voter);
        const variant = text === 'Eligible' ? 'success' : text === 'Rejected' ? 'error' : 'warning';
        return <Badge variant={variant}>{text}</Badge>;
      },
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading voters..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold gradient-text">Voter Management</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Manage voter registrations and approvals</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} value={stats.total} label="Total Voters" color="primary" />
        <StatCard icon={<UserCheck className="w-5 h-5" />} value={stats.verified} label="Verified" color="success" />
        <StatCard icon={<Clock className="w-5 h-5" />} value={stats.pending} label="Pending Approval" color="warning" />
        <StatCard icon={<XCircle className="w-5 h-5" />} value={stats.rejected} label="Rejected" color="error" />
      </motion.div>

      {/* Filter Tabs & Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-dark-100 dark:bg-dark-800 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'bg-dark-200 dark:bg-dark-700 text-dark-500 dark:text-dark-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        {filteredVoters.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="No Voters Found"
              description={
                searchQuery
                  ? 'Try adjusting your search query or filters.'
                  : 'No voters have registered yet.'
              }
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={filteredVoters as unknown as Record<string, unknown>[]}
              searchable={false}
              searchKeys={['name', 'email']}
              actions={(item) => {
                const voter = item as unknown as Voter;
                const status = getVoterStatus(voter);
                return (
                  <>
                    {status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveVoter(voter)}
                          disabled={isUpdating}
                          className="p-2 rounded-lg hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors text-success-600 dark:text-success-400 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectVoter(voter)}
                          disabled={isUpdating}
                          className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors text-error-600 dark:text-error-400 disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDetailModal({ open: true, voter })}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-500"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </>
                );
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Voter Detail Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, voter: null })}
        title="Voter Details"
        size="lg"
      >
        {detailModal.voter && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={detailModal.voter.name} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                  {detailModal.voter.name}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400">{detailModal.voter.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Voter ID
                </p>
                <p className="text-sm text-dark-900 dark:text-white font-mono">
                  {detailModal.voter.id}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Aadhaar ID
                </p>
                <p className="text-sm text-dark-900 dark:text-white font-mono">
                  {maskAadhaar(detailModal.voter.aadhaar_id)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Wallet Address
                </p>
                <p className="text-sm text-dark-900 dark:text-white font-mono break-all">
                  {detailModal.voter.wallet_address || 'Not connected'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Status
                </p>
                {(() => {
                  const status = getVoterStatus(detailModal.voter);
                  const variant = status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending';
                  const label = status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending';
                  return <Badge variant={variant}>{label}</Badge>;
                })()}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Is Approved
                </p>
                <p className="text-sm text-dark-900 dark:text-white">
                  {detailModal.voter.is_approved ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Is Verified
                </p>
                <p className="text-sm text-dark-900 dark:text-white">
                  {detailModal.voter.is_verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Registered On
                </p>
                <p className="text-sm text-dark-900 dark:text-white">
                  {formatDateTime(detailModal.voter.created_at)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Voting Status
                </p>
                {(() => {
                  const text = getVotingStatusText(detailModal.voter);
                  const variant = text === 'Eligible' ? 'success' : text === 'Rejected' ? 'error' : 'warning';
                  return <Badge variant={variant}>{text}</Badge>;
                })()}
              </div>
            </div>

            {getVoterStatus(detailModal.voter) === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isUpdating}
                  onClick={() => {
                    rejectVoter(detailModal.voter!);
                    setDetailModal({ open: false, voter: null });
                  }}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                  onClick={() => {
                    approveVoter(detailModal.voter!);
                    setDetailModal({ open: false, voter: null });
                  }}
                >
                  <Check className="w-4 h-4" /> Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
