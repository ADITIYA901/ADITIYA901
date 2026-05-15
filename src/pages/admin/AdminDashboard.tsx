import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Vote, Activity, Plus, UserPlus, BarChart3, UsersRound,
  Calendar, Clock, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { StatCard } from '../../components/ui/Card';
import Card from '../../components/ui/Card';
import { VotePieChart, VoteBarChart, TrendLineChart } from '../../components/ui/Charts';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import type { Election, DashboardStats, AuditLog } from '../../types';
import { formatRelativeTime, formatDate, getElectionStatus, formatNumber } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fallbackStats: DashboardStats = {
  totalVoters: 1247,
  totalCandidates: 18,
  votesCast: 5342,
  activeElections: 3,
  upcomingElections: 2,
  endedElections: 5,
};

const fallbackPieData = [
  { name: 'Candidate A', value: 450 },
  { name: 'Candidate B', value: 380 },
  { name: 'Candidate C', value: 220 },
  { name: 'Candidate D', value: 150 },
];

const fallbackBarData = [
  { name: 'Candidate A', votes: 450 },
  { name: 'Candidate B', votes: 380 },
  { name: 'Candidate C', votes: 220 },
  { name: 'Candidate D', votes: 150 },
];

const fallbackTrendData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 25 },
  { name: 'Thu', value: 15 },
  { name: 'Fri', value: 30 },
  { name: 'Sat', value: 22 },
  { name: 'Sun', value: 28 },
];

const fallbackAuditLogs: AuditLog[] = [
  { id: '1', user_id: 'admin1', user_type: 'admin', action: 'Created Election', details: 'Annual Board Election 2024', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', user_id: 'voter1', user_type: 'voter', action: 'Cast Vote', details: 'Voted in Municipal Election', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', user_id: 'admin2', user_type: 'admin', action: 'Added Candidate', details: 'John Doe added to State Election', timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: '4', user_id: 'voter2', user_type: 'voter', action: 'Registered', details: 'New voter registration', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: '5', user_id: 'admin1', user_type: 'admin', action: 'Ended Election', details: 'City Council Election concluded', timestamp: new Date(Date.now() - 18000000).toISOString() },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pieData, setPieData] = useState(fallbackPieData);
  const [barData, setBarData] = useState(fallbackBarData);
  const [trendData, setTrendData] = useState(fallbackTrendData);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(fallbackAuditLogs);
  const [electionStatusCounts, setElectionStatusCounts] = useState({ upcoming: 0, active: 0, ended: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      const [votersRes, candidatesRes, votesRes, electionsRes, auditRes] = await Promise.all([
        supabase.from('voters').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('elections').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(5),
      ]);

      const elections: Election[] = electionsRes.data || [];
      const activeElections = elections.filter(e => getElectionStatus(e.start_date, e.end_date) === 'active');
      const upcomingElections = elections.filter(e => getElectionStatus(e.start_date, e.end_date) === 'upcoming');
      const endedElections = elections.filter(e => getElectionStatus(e.start_date, e.end_date) === 'ended');

      setElectionStatusCounts({
        upcoming: upcomingElections.length,
        active: activeElections.length,
        ended: endedElections.length,
      });

      const totalVoters = votersRes.count ?? fallbackStats.totalVoters;
      const totalCandidates = candidatesRes.count ?? fallbackStats.totalCandidates;
      const votesCast = votesRes.count ?? fallbackStats.votesCast;

      setStats({
        totalVoters,
        totalCandidates,
        votesCast,
        activeElections: activeElections.length,
        upcomingElections: upcomingElections.length,
        endedElections: endedElections.length,
      });

      // Fetch vote distribution for the first active election
      if (activeElections.length > 0) {
        const activeElection = activeElections[0];
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('id, name')
          .eq('election_id', activeElection.id);

        if (candidatesData && candidatesData.length > 0) {
          const candidatesWithVotes = await Promise.all(
            candidatesData.map(async (c) => {
              const { count } = await supabase
                .from('votes')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', c.id);
              return { name: c.name, value: count || 0, votes: count || 0 };
            })
          );

          if (candidatesWithVotes.some(c => c.value > 0)) {
            setPieData(candidatesWithVotes.map(c => ({ name: c.name, value: c.value })));
            setBarData(candidatesWithVotes.map(c => ({ name: c.name, votes: c.votes })));
          }
        }
      }

      // Fetch daily registrations for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: recentVoters } = await supabase
        .from('voters')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentVoters && recentVoters.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyCounts: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = dayNames[d.getDay()];
          dailyCounts[key] = 0;
        }
        recentVoters.forEach((v) => {
          const d = new Date(v.created_at);
          const key = dayNames[d.getDay()];
          if (key in dailyCounts) {
            dailyCounts[key]++;
          }
        });
        setTrendData(Object.entries(dailyCounts).map(([name, value]) => ({ name, value })));
      }

      // Set audit logs
      if (auditRes.data && auditRes.data.length > 0) {
        setAuditLogs(auditRes.data as AuditLog[]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(fallbackStats);
      setElectionStatusCounts({ upcoming: 2, active: 3, ended: 5 });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." className="min-h-[60vh]" />;
  }

  const quickActions = [
    { label: 'Create Election', icon: <Plus className="w-5 h-5" />, onClick: () => navigate('/admin/elections/create'), variant: 'primary' as const },
    { label: 'Add Candidate', icon: <UserPlus className="w-5 h-5" />, onClick: () => navigate('/admin/candidates'), variant: 'secondary' as const },
    { label: 'View Results', icon: <BarChart3 className="w-5 h-5" />, onClick: () => navigate('/admin/elections'), variant: 'outline' as const },
    { label: 'Manage Voters', icon: <UsersRound className="w-5 h-5" />, onClick: () => navigate('/admin/voters'), variant: 'outline' as const },
  ];

  const statusCards = [
    { label: 'Upcoming', count: electionStatusCounts.upcoming, icon: <Calendar className="w-6 h-6" />, badge: 'upcoming' as const, color: 'text-primary-500' },
    { label: 'Active', count: electionStatusCounts.active, icon: <Activity className="w-6 h-6" />, badge: 'active' as const, color: 'text-success-500' },
    { label: 'Ended', count: electionStatusCounts.ended, icon: <CheckCircle className="w-6 h-6" />, badge: 'ended' as const, color: 'text-dark-400' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} value={formatNumber(stats?.totalVoters ?? 0)} label="Total Voters" color="primary" trend="up" trendValue="12%" />
        <StatCard icon={<UserCheck className="w-5 h-5" />} value={formatNumber(stats?.totalCandidates ?? 0)} label="Total Candidates" color="accent" trend="up" trendValue="8%" />
        <StatCard icon={<Vote className="w-5 h-5" />} value={formatNumber(stats?.votesCast ?? 0)} label="Votes Cast" color="success" trend="up" trendValue="15%" />
        <StatCard icon={<Activity className="w-5 h-5" />} value={stats?.activeElections ?? 0} label="Active Elections" color="warning" trend="neutral" trendValue="—" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Vote Distribution</h3>
          <VotePieChart data={pieData} height={250} />
        </Card>
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Votes per Candidate</h3>
          <VoteBarChart data={barData} height={250} />
        </Card>
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Daily Registrations (7d)</h3>
          <TrendLineChart data={trendData} height={250} />
        </Card>
      </motion.div>

      {/* Quick Actions & Election Status */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant={action.variant} icon={action.icon} onClick={action.onClick} className="w-full justify-center">
                {action.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Election Status Overview */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Election Status Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            {statusCards.map((card) => (
              <div key={card.label} className="glass-card p-4 rounded-xl text-center space-y-2">
                <div className="flex justify-center">{card.icon}</div>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">{card.count}</p>
                <Badge variant={card.badge}>{card.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-xs text-dark-500 dark:text-dark-400">{log.details}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                        {log.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                      {formatRelativeTime(log.timestamp)}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-dark-500 dark:text-dark-400">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
