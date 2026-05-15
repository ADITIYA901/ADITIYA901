import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Square, Users, Vote, Clock, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CountdownTimer from '../../components/ui/CountdownTimer';
import BlockchainHash from '../../components/ui/BlockchainHash';
import Modal from '../../components/ui/Modal';
import { VotePieChart } from '../../components/ui/Charts';
import type { Election, Candidate, Vote } from '../../types';
import { formatDateTime, formatRelativeTime, getElectionStatus, formatNumber, getPercentage } from '../../utils/helpers';

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
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [candidateVotes, setCandidateVotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [endModal, setEndModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (id) fetchElectionData();
  }, [id]);

  async function fetchElectionData() {
    setIsLoading(true);
    try {
      // Fetch election
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();

      if (electionError || !electionData) {
        toast.error('Election not found');
        navigate('/admin/elections');
        return;
      }

      setElection(electionData as Election);

      // Fetch candidates
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', id);

      setCandidates((candidatesData as Candidate[]) || []);

      // Fetch votes for this election
      const { data: votesData } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', id)
        .order('timestamp', { ascending: false })
        .limit(10);

      const votesList = (votesData as Vote[]) || [];
      setVotes(votesList);

      // Count total votes
      const { count } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('election_id', id);

      setTotalVotes(count || 0);

      // Count total voters for participation rate
      const { count: voterCount } = await supabase
        .from('voters')
        .select('id', { count: 'exact', head: true });

      setTotalVoters(voterCount || 0);

      // Count votes per candidate
      const voteCounts: Record<string, number> = {};
      if (candidatesData) {
        for (const candidate of candidatesData) {
          const { count: cCount } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: true })
            .eq('candidate_id', candidate.id);
          voteCounts[candidate.id] = cCount || 0;
        }
      }
      setCandidateVotes(voteCounts);
    } catch (error) {
      console.error('Error fetching election data:', error);
      toast.error('Failed to load election details');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEndElection() {
    setIsEnding(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('elections')
        .update({ end_date: now, status: 'ended' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Election ended successfully');
      setElection(prev => prev ? { ...prev, end_date: now, status: 'ended' as const } : null);
      setEndModal(false);
    } catch (error) {
      console.error('Error ending election:', error);
      toast.error('Failed to end election');
    } finally {
      setIsEnding(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading election details..." className="min-h-[60vh]" />;
  }

  if (!election) return null;

  const status = getElectionStatus(election.start_date, election.end_date);
  const participationRate = getPercentage(totalVotes, totalVoters);
  const pieData = candidates.map(c => ({
    name: c.name,
    value: candidateVotes[c.id] || 0,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/elections')}
            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-dark-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{election.title}</h1>
            <p className="text-dark-500 dark:text-dark-400 mt-1">{election.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status === 'upcoming' ? 'upcoming' : status === 'active' ? 'active' : 'ended'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {status === 'active' && (
            <Button variant="danger" size="sm" icon={<Square className="w-4 h-4" />} onClick={() => setEndModal(true)}>
              End Election
            </Button>
          )}
        </div>
      </motion.div>

      {/* Election Info Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-dark-500 dark:text-dark-400">Start Date</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-dark-900 dark:text-white">{formatDateTime(election.start_date)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-dark-500 dark:text-dark-400">End Date</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning-500" />
                <span className="text-sm font-medium text-dark-900 dark:text-white">{formatDateTime(election.end_date)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Votes</p>
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-success-500" />
                <span className="text-sm font-medium text-dark-900 dark:text-white">{formatNumber(totalVotes)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-dark-500 dark:text-dark-400">Countdown</p>
              {status !== 'ended' ? (
                <CountdownTimer targetDate={status === 'upcoming' ? election.start_date : election.end_date} size="sm" />
              ) : (
                <span className="text-sm font-medium text-dark-500">Election ended</span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Live Statistics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatNumber(totalVotes)}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Votes Cast</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{participationRate}%</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Participation Rate</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{candidates.length}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Candidates</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Candidates with Vote Counts */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Candidates & Vote Counts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => {
              const votes = candidateVotes[candidate.id] || 0;
              const pct = getPercentage(votes, totalVotes);
              return (
                <div key={candidate.id} className="glass-card p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    {candidate.photo_url ? (
                      <img src={candidate.photo_url} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-dark-900 dark:text-white">{candidate.name}</p>
                      <p className="text-xs text-dark-500 dark:text-dark-400">{candidate.party}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-500 dark:text-dark-400">{votes} votes</span>
                      <span className="font-medium text-dark-900 dark:text-white">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {candidates.length === 0 && (
              <p className="text-dark-500 dark:text-dark-400 col-span-full text-center py-8">No candidates added yet.</p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Vote Distribution Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Vote Distribution</h3>
          {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
            <VotePieChart data={pieData} height={300} />
          ) : (
            <p className="text-dark-500 dark:text-dark-400 text-center py-8">No votes cast yet.</p>
          )}
        </Card>
      </motion.div>

      {/* Recent Votes Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Recent Votes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Voter ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Transaction Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                {votes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300 font-mono">
                      {vote.voter_id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <BlockchainHash hash={vote.tx_hash} truncated />
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                      {formatRelativeTime(vote.timestamp)}
                    </td>
                  </tr>
                ))}
                {votes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-dark-500 dark:text-dark-400">
                      No votes recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* End Election Confirmation Modal */}
      <Modal isOpen={endModal} onClose={() => setEndModal(false)} title="End Election">
        <p className="text-dark-600 dark:text-dark-300 mb-6">
          Are you sure you want to end <strong>{election.title}</strong>? This will immediately stop all voting and finalize the results. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEndModal(false)}>Cancel</Button>
          <Button variant="danger" isLoading={isEnding} onClick={handleEndElection}>End Election</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
