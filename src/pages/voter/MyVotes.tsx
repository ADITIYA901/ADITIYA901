import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Vote, Clock, Download, Eye, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import BlockchainHash from '../../components/ui/BlockchainHash';
import type { Vote as VoteType, Election, Candidate } from '../../types';
import { formatDateTime, formatDate } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface VoteWithDetails extends VoteType {
  election_title?: string;
  candidate_name?: string;
  candidate_party?: string;
}

export default function MyVotes() {
  const { user } = useAuth();
  const voter = user as import('../../types').Voter | null;

  const [votes, setVotes] = useState<VoteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState<VoteWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [uniqueElections, setUniqueElections] = useState(0);

  useEffect(() => {
    if (voter) fetchVotes();
  }, [voter]);

  async function fetchVotes() {
    if (!voter) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', voter.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const votesData: VoteType[] = data || [];

      // Enrich with election and candidate details
      const enrichedVotes = await Promise.all(
        votesData.map(async (vote) => {
          const [electionRes, candidateRes] = await Promise.all([
            supabase.from('elections').select('title').eq('id', vote.election_id).maybeSingle(),
            supabase.from('candidates').select('name, party').eq('id', vote.candidate_id).maybeSingle(),
          ]);

          return {
            ...vote,
            election_title: electionRes.data?.title || 'Unknown Election',
            candidate_name: candidateRes.data?.name || 'Unknown Candidate',
            candidate_party: candidateRes.data?.party || 'Unknown Party',
          };
        })
      );

      setVotes(enrichedVotes);

      // Count unique elections
      const electionIds = new Set(enrichedVotes.map(v => v.election_id));
      setUniqueElections(electionIds.size);
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast.error('Failed to load voting history');
    } finally {
      setIsLoading(false);
    }
  }

  function openVoteDetail(vote: VoteWithDetails) {
    setSelectedVote(vote);
    setShowDetailModal(true);
  }

  function downloadReceipt(vote: VoteWithDetails) {
    const receiptText = `
========================================
        BLOCKVOTE - VOTE RECEIPT
========================================

Election: ${vote.election_title}
Candidate: ${vote.candidate_name}
Party: ${vote.candidate_party}

Transaction Hash: ${vote.tx_hash}
Block Number: ${vote.block_number}
Timestamp: ${formatDateTime(vote.timestamp)}
Voter ID: ${vote.voter_id}

========================================
This receipt confirms your vote was
recorded on the blockchain.
Keep this receipt for your records.
========================================
`.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${vote.election_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading voting history..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Voting History</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          View all your past votes and receipts
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{votes.length}</p>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Total Votes Cast</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{uniqueElections}</p>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Elections Participated</p>
          </div>
        </div>
      </motion.div>

      {/* Vote Cards */}
      {votes.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<Vote className="w-12 h-12" />}
            title="You haven't voted yet"
            description="Once you cast your first vote, it will appear here with a blockchain receipt."
            action={
              <Link to="/voter/elections">
                <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  View Active Elections
                </Button>
              </Link>
            }
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {votes.map((vote) => (
            <motion.div key={vote.id} variants={itemVariants}>
              <Card hover onClick={() => openVoteDetail(vote)}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-dark-900 dark:text-white">{vote.election_title}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {vote.candidate_name} <span className="text-dark-500 dark:text-dark-400 font-normal">({vote.candidate_party})</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-dark-500 dark:text-dark-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(vote.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <BlockchainHash hash={vote.tx_hash} label="Tx Hash" />
                    <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                      <p className="text-xs text-dark-500 dark:text-dark-400">Block</p>
                      <p className="text-sm font-mono font-medium text-dark-900 dark:text-white">#{vote.block_number.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Vote Receipt" size="lg">
        {selectedVote && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success-500 shrink-0" />
              <div>
                <p className="font-semibold text-success-700 dark:text-success-400">Vote Confirmed</p>
                <p className="text-sm text-success-600 dark:text-success-500">Your vote was successfully recorded on the blockchain</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Election</p>
                <p className="text-sm font-medium text-dark-900 dark:text-white">{selectedVote.election_title}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Candidate</p>
                <p className="text-sm font-medium text-dark-900 dark:text-white">{selectedVote.candidate_name}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">{selectedVote.candidate_party}</p>
              </div>
              <BlockchainHash hash={selectedVote.tx_hash} label="Transaction Hash" truncated={false} />
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Block Number</p>
                <p className="text-sm font-mono font-medium text-dark-900 dark:text-white">#{selectedVote.block_number.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Timestamp</p>
                <p className="text-sm font-medium text-dark-900 dark:text-white">{formatDateTime(selectedVote.timestamp)}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Voter ID</p>
                <p className="text-sm font-mono text-dark-900 dark:text-white">{selectedVote.voter_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={() => downloadReceipt(selectedVote)}
                className="flex-1"
              >
                Download Receipt
              </Button>
              <Button variant="primary" onClick={() => setShowDetailModal(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
