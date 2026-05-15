import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Wallet, Vote, BarChart3, Bell, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Users, Trophy, Link2, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CountdownTimer from '../../components/ui/CountdownTimer';
import type { Election, Announcement, Vote as VoteType } from '../../types';
import { formatDate, formatRelativeTime, getElectionStatus, formatNumber } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VoterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, account, connectWallet, isConnecting } = useBlockchain();
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [votes, setVotes] = useState<VoteType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const voter = user as import('../../types').Voter | null;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      const [electionsRes, announcementsRes, votesRes] = await Promise.all([
        supabase.from('elections').select('*').order('start_date', { ascending: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
        voter ? supabase.from('votes').select('*').eq('voter_id', voter.id).order('timestamp', { ascending: false }) : Promise.resolve({ data: [] }),
      ]);

      const allElections: Election[] = electionsRes.data || [];
      const active = allElections.filter(e => getElectionStatus(e.start_date, e.end_date) === 'active');
      setActiveElections(active);
      setAnnouncements(announcementsRes.data || []);
      setVotes(votesRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." className="min-h-[60vh]" />;
  }

  const verificationSteps = [
    { label: 'Identity Verified', done: voter?.is_verified ?? false, icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Admin Approved', done: voter?.is_approved ?? false, icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const lastVotedElection = votes.length > 0 ? votes[0] : null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
          Welcome back, <span className="gradient-text">{voter?.name || 'Voter'}</span>
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Here is your voting dashboard overview
        </p>
      </motion.div>

      {/* Verification & Wallet Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Verification Status</h3>
          </div>
          <div className="space-y-3">
            {verificationSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  step.done
                    ? 'border-success-500 bg-success-50 dark:bg-success-900/30 text-success-500'
                    : 'border-dark-300 dark:border-dark-600 text-dark-400'
                }`}>
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark-700 dark:text-dark-300">{step.label}</p>
                </div>
                <Badge variant={step.done ? 'verified' : 'pending'}>
                  {step.done ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
          {voter?.is_verified && voter?.is_approved && (
            <div className="mt-4 p-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
              <p className="text-sm text-success-700 dark:text-success-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> You are fully verified and can vote
              </p>
            </div>
          )}
        </Card>

        {/* Wallet Connection Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Wallet Connection</h3>
          </div>
          {isConnected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <p className="text-sm text-success-700 dark:text-success-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Wallet Connected
                </p>
              </div>
              <div className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Connected Address</p>
                <code className="text-sm font-mono text-primary-600 dark:text-primary-400 break-all">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-sm text-warning-700 dark:text-warning-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Wallet not connected
                </p>
              </div>
              <Button
                variant="primary"
                icon={<Wallet className="w-5 h-5" />}
                onClick={handleConnectWallet}
                isLoading={isConnecting}
                className="w-full"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Active Elections */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Active Elections</h2>
          <Link to="/voter/elections" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {activeElections.length === 0 ? (
          <Card>
            <p className="text-center text-dark-500 dark:text-dark-400 py-4">
              No active elections at the moment
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeElections.slice(0, 3).map((election) => (
              <Card key={election.id} hover>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-dark-900 dark:text-white line-clamp-1">{election.title}</h3>
                    <Badge variant="active">Active</Badge>
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2">{election.description}</p>
                  <CountdownTimer targetDate={election.end_date} size="sm" />
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Vote className="w-4 h-4" />}
                    onClick={() => navigate(`/voter/elections/${election.id}`)}
                    className="w-full"
                  >
                    Vote Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Announcements & My Voting History */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Latest Announcements</h3>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-dark-500 dark:text-dark-400 text-center py-4">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                  <h4 className="text-sm font-semibold text-dark-900 dark:text-white">{ann.title}</h4>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{ann.message}</p>
                  <p className="text-xs text-dark-400 dark:text-dark-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatRelativeTime(ann.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* My Voting History */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-success-500 to-success-600 text-white">
              <Vote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">My Voting History</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatNumber(votes.length)}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Total Votes Cast</p>
              </div>
              <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 text-center">
                <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                  {lastVotedElection ? formatDate(lastVotedElection.timestamp) : '--'}
                </p>
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Last Voted</p>
              </div>
            </div>
            <Link to="/voter/my-votes">
              <Button variant="outline" size="sm" icon={<Eye className="w-4 h-4" />} className="w-full">
                View Full History
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="primary"
              icon={<Vote className="w-5 h-5" />}
              onClick={() => navigate('/voter/elections')}
              className="w-full justify-center"
            >
              View Elections
            </Button>
            <Button
              variant="outline"
              icon={<BarChart3 className="w-5 h-5" />}
              onClick={() => navigate('/voter/results')}
              className="w-full justify-center"
            >
              Check Results
            </Button>
            <Button
              variant={isConnected ? 'secondary' : 'primary'}
              icon={<Wallet className="w-5 h-5" />}
              onClick={() => { if (!isConnected) handleConnectWallet(); else navigate('/voter/profile'); }}
              isLoading={!isConnected && isConnecting}
              className="w-full justify-center"
            >
              {isConnected ? 'Wallet Settings' : 'Connect Wallet'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
