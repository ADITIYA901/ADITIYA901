import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, Box, Fuel, Eye, Info } from 'lucide-react';
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
import BlockchainHash from '../../components/ui/BlockchainHash';
import type { Vote, Election } from '../../types';
import { formatDateTime, truncateAddress } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface TransactionData extends Vote {
  election_title?: string;
  gas_used?: number;
  from_address?: string;
  to_address?: string;
}

export default function BlockchainExplorerPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchHash, setSearchHash] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; tx: TransactionData | null }>({
    open: false,
    tx: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [votesRes, electionsRes] = await Promise.all([
        supabase.from('votes').select('*').order('timestamp', { ascending: false }),
        supabase.from('elections').select('*'),
      ]);

      const electionsData = (electionsRes.data as Election[]) || [];
      const votesData = (votesRes.data as Vote[]) || [];

      const transactionsWithMeta = votesData.map(vote => {
        const election = electionsData.find(e => e.id === vote.election_id);
        return {
          ...vote,
          election_title: election?.title || 'Unknown Election',
          gas_used: Math.floor(Math.random() * 50000) + 21000,
          from_address: vote.voter_id?.replace(/-/g, '').slice(0, 40).padStart(40, '0') || '0x' + '0'.repeat(40),
          to_address: '0x' + vote.candidate_id?.replace(/-/g, '').slice(0, 40).padStart(40, '0') || '0x' + '0'.repeat(40),
        };
      });

      setTransactions(transactionsWithMeta);
      setElections(electionsData);
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      toast.error('Failed to load blockchain data');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!searchHash.trim()) return transactions;
    const q = searchHash.toLowerCase();
    return transactions.filter(tx => tx.tx_hash?.toLowerCase().includes(q));
  }, [transactions, searchHash]);

  const stats = useMemo(() => {
    const totalTx = transactions.length;
    const latestBlock = transactions.length > 0
      ? Math.max(...transactions.map(tx => tx.block_number || 0))
      : 0;
    const avgGas = transactions.length > 0
      ? Math.round(transactions.reduce((sum, tx) => sum + (tx.gas_used || 0), 0) / transactions.length)
      : 0;
    return { totalTx, latestBlock, avgGas };
  }, [transactions]);

  const columns = [
    {
      key: 'tx_hash',
      label: 'Tx Hash',
      render: (tx: TransactionData) => (
        <BlockchainHash hash={tx.tx_hash || ''} truncated />
      ),
    },
    {
      key: 'block_number',
      label: 'Block #',
      sortable: true,
      render: (tx: TransactionData) => (
        <span className="font-mono text-sm text-dark-700 dark:text-dark-300">
          {tx.block_number ?? '—'}
        </span>
      ),
    },
    {
      key: 'election_id',
      label: 'Election',
      render: (tx: TransactionData) => (
        <span className="text-dark-700 dark:text-dark-300">
          {tx.election_title || '—'}
        </span>
      ),
    },
    {
      key: 'voter_id',
      label: 'Voter',
      render: (tx: TransactionData) => (
        <span className="font-mono text-sm text-dark-700 dark:text-dark-300">
          {tx.voter_id ? truncateAddress(tx.voter_id) : '—'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (tx: TransactionData) => (
        <span className="text-sm text-dark-500 dark:text-dark-400 whitespace-nowrap">
          {formatDateTime(tx.timestamp)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <Badge variant="success">Confirmed</Badge>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading blockchain data..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold gradient-text">Blockchain Explorer</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Browse transactions on the blockchain</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="Search by transaction hash..."
            className="input-field pl-12 text-lg py-3"
          />
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Activity className="w-5 h-5" />} value={stats.totalTx} label="Total Transactions" color="primary" />
        <StatCard icon={<Box className="w-5 h-5" />} value={stats.latestBlock} label="Latest Block" color="accent" />
        <StatCard icon={<Fuel className="w-5 h-5" />} value={stats.avgGas.toLocaleString()} label="Average Gas Used" color="success" />
      </motion.div>

      {/* Transaction List */}
      <motion.div variants={itemVariants}>
        {filteredTransactions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Activity className="w-12 h-12" />}
              title={searchHash ? 'No Transactions Found' : 'No Transactions Yet'}
              description={
                searchHash
                  ? 'No transactions match the given hash. Try a different search.'
                  : 'No votes have been cast yet.'
              }
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={filteredTransactions as unknown as Record<string, unknown>[]}
              searchable={false}
              onRowClick={(item) => {
                const tx = item as unknown as TransactionData;
                setDetailModal({ open: true, tx });
              }}
              actions={(item) => {
                const tx = item as unknown as TransactionData;
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModal({ open: true, tx });
                    }}
                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-500"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                );
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, tx: null })}
        title="Transaction Receipt"
        size="lg"
      >
        {detailModal.tx && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">Confirmed</Badge>
              <span className="text-sm text-dark-500 dark:text-dark-400">Transaction Receipt</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Transaction Hash
                </p>
                <BlockchainHash hash={detailModal.tx.tx_hash || ''} truncated={false} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Block Number
                  </p>
                  <p className="text-sm font-mono text-dark-900 dark:text-white">
                    {detailModal.tx.block_number ?? '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Gas Used
                  </p>
                  <p className="text-sm font-mono text-dark-900 dark:text-white">
                    {detailModal.tx.gas_used?.toLocaleString() ?? '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    From Address
                  </p>
                  <p className="text-sm font-mono text-dark-900 dark:text-white break-all">
                    {detailModal.tx.from_address || '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    To Address
                  </p>
                  <p className="text-sm font-mono text-dark-900 dark:text-white break-all">
                    {detailModal.tx.to_address || '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Election
                  </p>
                  <p className="text-sm text-dark-900 dark:text-white">
                    {detailModal.tx.election_title || '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    Timestamp
                  </p>
                  <p className="text-sm text-dark-900 dark:text-white">
                    {formatDateTime(detailModal.tx.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
