import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Vote, ArrowLeft, CheckCircle2, Clock, Calendar, Users, Download,
  AlertCircle, Shield, Radio, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import CountdownTimer from '../../components/ui/CountdownTimer';
import Avatar from '../../components/ui/Avatar';
import BlockchainHash from '../../components/ui/BlockchainHash';
import { VotePieChart } from '../../components/ui/Charts';
import type { Election, Candidate, Vote as VoteType, ElectionResult } from '../../types';
import { formatDate, formatDateTime, getElectionStatus, getPercentage, formatNumber } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectWallet, isConnecting, simulateTransaction } = useBlockchain();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [existingVote, setExistingVote] = useState<VoteType | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<{
    tx_hash: string;
    block_number: number;
    timestamp: string;
    candidate_name: string;
    candidate_party: string;
  } | null>(null);

  const [results, setResults] = useState<ElectionResult[]>([]);

  const voter = user as import('../../types').Voter | null;

  useEffect(() => {
    if (id) fetchElectionData();
  }, [id]);

  async function fetchElectionData() {
    setIsLoading(true);
    try {
      const [electionRes, candidatesRes, voteRes] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id!).maybeSingle(),
        supabase.from('candidates').select('*').eq('election_id', id!),
        voter
          ? supabase.from('votes').select('*').eq('election_id', id!).eq('voter_id', voter.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (!electionRes.data) {
        toast.error('Election not found');
        navigate('/voter/elections');
        return;
      }

      setElection(electionRes.data);
      setCandidates(candidatesRes.data || []);
      setExistingVote(voteRes.data);

      // If election ended, fetch results
      const status = getElectionStatus(electionRes.data.start_date, electionRes.data.end_date);
      if (status === 'ended') {
        await fetchResults();
      }
    } catch (error) {
      console.error('Error fetching election data:', error);
      toast.error('Failed to load election details');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchResults() {
    if (!id) return;
    try {
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('id, name, party')
        .eq('election_id', id);

      if (!candidatesData) return;

      const resultsWithVotes = await Promise.all(
        candidatesData.map(async (c) => {
          const { count } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: true })
            .eq('candidate_id', c.id)
            .eq('election_id', id!);
          return {
            candidate_id: c.id,
            candidate_name: c.name,
            party: c.party,
            vote_count: count || 0,
            percentage: 0,
          };
        })
      );

      const totalVotes = resultsWithVotes.reduce((sum, r) => sum + r.vote_count, 0);
      const computedResults = resultsWithVotes.map((r) => ({
        ...r,
        percentage: getPercentage(r.vote_count, totalVotes),
      }));

      setResults(computedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
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

  function handleVoteClick() {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first');
      return;
    }
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!voter?.is_verified || !voter?.is_approved) {
      toast.error('You must be verified and approved to vote');
      return;
    }
    setShowConfirmModal(true);
  }

  async function handleConfirmVote() {
    if (!selectedCandidate || !id || !voter) return;
    setIsVoting(true);
    setShowConfirmModal(false);

    try {
      const { txHash, blockNumber } = await simulateTransaction();

      const selected = candidates.find(c => c.id === selectedCandidate);
      const now = new Date().toISOString();

      const { error } = await supabase.from('votes').insert({
        election_id: id,
        candidate_id: selectedCandidate,
        voter_id: voter.id,
        tx_hash: txHash,
        block_number: blockNumber,
        timestamp: now,
      });

      if (error) throw error;

      setVoteReceipt({
        tx_hash: txHash,
        block_number: blockNumber,
        timestamp: now,
        candidate_name: selected?.name || 'Unknown',
        candidate_party: selected?.party || 'Unknown',
      });

      setExistingVote({
        id: '',
        election_id: id,
        candidate_id: selectedCandidate,
        voter_id: voter.id,
        tx_hash: txHash,
        block_number: blockNumber,
        timestamp: now,
      });

      setShowSuccessModal(true);
      toast.success('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  }

  function downloadReceipt() {
    if (!voteReceipt || !election) return;

    const receiptText = `
========================================
        BLOCKVOTE - VOTE RECEIPT
========================================

Election: ${election.title}
Candidate: ${voteReceipt.candidate_name}
Party: ${voteReceipt.candidate_party}

Transaction Hash: ${voteReceipt.tx_hash}
Block Number: ${voteReceipt.block_number}
Timestamp: ${formatDateTime(voteReceipt.timestamp)}

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
    a.download = `vote-receipt-${election.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading election details..." className="min-h-[60vh]" />;
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-500 dark:text-dark-400">Election not found</p>
        <Button variant="primary" onClick={() => navigate('/voter/elections')} className="mt-4">
          Back to Elections
        </Button>
      </div>
    );
  }

  const status = getElectionStatus(election.start_date, election.end_date);
  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);
  const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);
  const pieData = results.map(r => ({ name: r.candidate_name, value: r.vote_count }));

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case 'upcoming': return 'upcoming' as const;
      case 'active': return 'active' as const;
      case 'ended': return 'ended' as const;
      default: return 'info' as const;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => navigate('/voter/elections')}
          className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Elections
        </button>
      </motion.div>

      {/* Election Info */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{election.title}</h1>
                <p className="text-dark-500 dark:text-dark-400">{election.description}</p>
              </div>
              <Badge variant={statusBadgeVariant(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500 dark:text-dark-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{candidates.length} Candidates</span>
              </div>
            </div>
            {(status === 'upcoming' || status === 'active') && (
              <CountdownTimer
                targetDate={status === 'upcoming' ? election.start_date : election.end_date}
                size="md"
              />
            )}
          </div>
        </Card>
      </motion.div>

      {/* Already Voted Message */}
      {existingVote && (
        <motion.div variants={itemVariants}>
          <Card className="border-success-200 dark:border-success-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/30">
                <CheckCircle2 className="w-6 h-6 text-success-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-900 dark:text-white">You have already voted</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                  Your vote was recorded on {formatDateTime(existingVote.timestamp)}
                </p>
              </div>
              <Link to="/voter/my-votes">
                <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4" />}>
                  View Receipt
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Active Election - Voting Section */}
      {status === 'active' && !existingVote && (
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Prerequisites check */}
          {(!isConnected || !voter?.is_verified || !voter?.is_approved) && (
            <Card className="border-warning-200 dark:border-warning-800">
              <div className="space-y-3">
                <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-500" /> Requirements to Vote
                </h3>
                <div className="space-y-2">
                  {!voter?.is_verified && (
                    <div className="flex items-center gap-2 text-sm text-warning-600 dark:text-warning-400">
                      <Radio className="w-4 h-4" /> Identity verification pending
                    </div>
                  )}
                  {!voter?.is_approved && (
                    <div className="flex items-center gap-2 text-sm text-warning-600 dark:text-warning-400">
                      <Radio className="w-4 h-4" /> Admin approval pending
                    </div>
                  )}
                  {!isConnected && (
                    <div className="flex items-center gap-2 text-sm text-warning-600 dark:text-warning-400">
                      <Radio className="w-4 h-4" /> Wallet not connected
                    </div>
                  )}
                </div>
                {!isConnected && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Shield className="w-4 h-4" />}
                    onClick={handleConnectWallet}
                    isLoading={isConnecting}
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Candidate Selection */}
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Select a Candidate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate) => {
              const isSelected = selectedCandidate === candidate.id;
              return (
                <motion.div
                  key={candidate.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    hover
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-primary-500 border-primary-500 dark:border-primary-500'
                        : ''
                    }`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar src={candidate.photo_url} name={candidate.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-dark-900 dark:text-white">{candidate.name}</h3>
                          {isSelected && (
                            <div className="p-1 rounded-full bg-primary-500 text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{candidate.party}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{candidate.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Cast Vote Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="primary"
              size="lg"
              icon={<Vote className="w-5 h-5" />}
              onClick={handleVoteClick}
              isLoading={isVoting}
              disabled={!selectedCandidate || !isConnected || !voter?.is_verified || !voter?.is_approved}
              className="min-w-[200px]"
            >
              Cast Your Vote
            </Button>
          </div>
        </motion.div>
      )}

      {/* Upcoming Election */}
      {status === 'upcoming' && (
        <motion.div variants={itemVariants}>
          <Card className="text-center py-8">
            <Clock className="w-12 h-12 text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Voting hasn't started yet</h3>
            <p className="text-dark-500 dark:text-dark-400 mt-2">
              This election opens on {formatDate(election.start_date)}. Please check back then.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Ended Election - Results */}
      {status === 'ended' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Election Results</h2>
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Vote Distribution</h3>
                <VotePieChart data={pieData} height={300} />
                <p className="text-sm text-dark-500 dark:text-dark-400 text-center mt-3">
                  Total votes: {formatNumber(totalVotes)}
                </p>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Candidate Breakdown</h3>
                <div className="space-y-3">
                  {results.sort((a, b) => b.vote_count - a.vote_count).map((result, index) => (
                    <div key={result.candidate_id} className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-4 h-4 text-warning-500" />}
                          <span className="font-medium text-dark-900 dark:text-white">{result.candidate_name}</span>
                          <span className="text-xs text-dark-500 dark:text-dark-400">({result.party})</span>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{result.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">{formatNumber(result.vote_count)} votes</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Your Vote">
        <div className="space-y-4">
          <p className="text-dark-600 dark:text-dark-300">
            You are about to cast your vote for:
          </p>
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3">
              <Avatar src={selectedCandidateData?.photo_url} name={selectedCandidateData?.name || ''} />
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">{selectedCandidateData?.name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">{selectedCandidateData?.party}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-dark-500 dark:text-dark-400">
            This action cannot be undone. Your vote will be permanently recorded on the blockchain.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmVote} isLoading={isVoting} className="flex-1">
              Confirm Vote
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Vote Cast Successfully!" size="lg">
        <div className="space-y-5 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-full bg-success-100 dark:bg-success-900/30">
              <CheckCircle2 className="w-12 h-12 text-success-500" />
            </div>
          </motion.div>

          <p className="text-dark-600 dark:text-dark-300">
            Your vote for <strong>{voteReceipt?.candidate_name}</strong> ({voteReceipt?.candidate_party}) has been recorded on the blockchain.
          </p>

          {voteReceipt && (
            <div className="space-y-3 text-left">
              <BlockchainHash hash={voteReceipt.tx_hash} label="Transaction Hash" />
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Block Number</p>
                <p className="text-sm font-mono font-medium text-dark-900 dark:text-white">#{voteReceipt.block_number.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Timestamp</p>
                <p className="text-sm font-medium text-dark-900 dark:text-white">{formatDateTime(voteReceipt.timestamp)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={downloadReceipt} className="flex-1">
              Download Receipt
            </Button>
            <Button variant="primary" onClick={() => setShowSuccessModal(false)} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
