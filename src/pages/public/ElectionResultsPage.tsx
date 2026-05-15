import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  Users,
} from 'lucide-react';
import { VotePieChart } from '../../components/ui/Charts';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

interface Candidate {
  name: string;
  party: string;
  votes: number;
  color: string;
}

interface Election {
  id: string;
  title: string;
  status: 'active' | 'ended';
  totalVotes: number;
  winner: string;
  candidates: Candidate[];
}

const mockElections: Election[] = [
  {
    id: '1',
    title: 'Student Council Election 2025',
    status: 'ended',
    totalVotes: 4520,
    winner: 'Alice Johnson',
    candidates: [
      { name: 'Alice Johnson', party: 'Progressive Alliance', votes: 2150, color: '#3b82f6' },
      { name: 'Bob Smith', party: 'Unity Party', votes: 1320, color: '#06b6d4' },
      { name: 'Carol Williams', party: 'Reform Coalition', votes: 680, color: '#22c55e' },
      { name: 'David Brown', party: 'Independent', votes: 370, color: '#f59e0b' },
    ],
  },
  {
    id: '2',
    title: 'Board of Directors Election 2025',
    status: 'ended',
    totalVotes: 1280,
    winner: 'Margaret Chen',
    candidates: [
      { name: 'Margaret Chen', party: 'Innovation Group', votes: 640, color: '#8b5cf6' },
      { name: 'Robert Taylor', party: 'Stability Party', votes: 420, color: '#ec4899' },
      { name: 'Susan Martinez', party: 'Growth Coalition', votes: 220, color: '#14b8a6' },
    ],
  },
  {
    id: '3',
    title: 'Community Council by-election',
    status: 'active',
    totalVotes: 890,
    winner: '',
    candidates: [
      { name: 'James Wilson', party: 'Green Party', votes: 380, color: '#22c55e' },
      { name: 'Patricia Lee', party: 'Forward Movement', votes: 310, color: '#3b82f6' },
      { name: 'Kevin Park', party: 'Independent', votes: 200, color: '#f59e0b' },
    ],
  },
];

export default function ElectionResultsPage() {
  const [selectedElectionId, setSelectedElectionId] = useState(mockElections[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedElection = mockElections.find((e) => e.id === selectedElectionId)!;

  const pieData = selectedElection.candidates.map((c) => ({
    name: c.name,
    value: c.votes,
    color: c.color,
  }));

  const winnerCandidate = selectedElection.candidates.find(
    (c) => c.name === selectedElection.winner
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 gradient-bg overflow-hidden">
        <div className="absolute inset-0 blockchain-grid" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
            {...fadeInUp}
          >
            Election Results
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            View verified election results published on the blockchain. All results
            are publicly auditable and tamper-proof.
          </motion.p>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Election Selector */}
          <motion.div
            className="mb-10"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Select an Election
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="input-field flex items-center justify-between cursor-pointer"
              >
                <span className="text-dark-900 dark:text-dark-100">
                  {selectedElection.title}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-dark-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 mt-1 w-full glass-card rounded-xl overflow-hidden shadow-xl"
                >
                  {mockElections.map((election) => (
                    <button
                      key={election.id}
                      onClick={() => {
                        setSelectedElectionId(election.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-dark-700/50 transition-colors ${
                        election.id === selectedElectionId
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-dark-700 dark:text-dark-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{election.title}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            election.status === 'ended'
                              ? 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                              : 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400'
                          }`}
                        >
                          {election.status === 'ended' ? 'Ended' : 'Active'}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Winner Announcement Card */}
          {winnerCandidate && (
            <motion.div
              className="mb-10"
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-card p-8 border-2 border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                      Winner Announcement
                    </p>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 dark:text-white">
                      {winnerCandidate.name}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="stat-card flex-1 text-center">
                    <p className="text-2xl font-bold text-dark-900 dark:text-white">
                      {winnerCandidate.votes.toLocaleString()}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Votes Received</p>
                  </div>
                  <div className="stat-card flex-1 text-center">
                    <p className="text-2xl font-bold text-dark-900 dark:text-white">
                      {((winnerCandidate.votes / selectedElection.totalVotes) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Vote Share</p>
                  </div>
                  <div className="stat-card flex-1 text-center">
                    <p className="text-2xl font-bold text-dark-900 dark:text-white">
                      {winnerCandidate.party}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Party</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active election notice */}
          {selectedElection.status === 'active' && (
            <motion.div
              className="mb-10"
              {...fadeInUp}
            >
              <div className="glass-card p-6 border-2 border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-warning-700 dark:text-warning-400">
                      Election in Progress
                    </p>
                    <p className="text-sm text-warning-600 dark:text-warning-500">
                      Results shown are live and may change as more votes are cast.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Charts & Table */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Vote Distribution Pie Chart */}
            <motion.div variants={fadeInUp}>
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Vote Distribution
                </h3>
                <VotePieChart data={pieData} height={300} />
              </div>
            </motion.div>

            {/* Candidate Vote Breakdown Table */}
            <motion.div variants={fadeInUp}>
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  Candidate Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-200 dark:border-dark-700">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-dark-600 dark:text-dark-300">
                          Candidate
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-dark-600 dark:text-dark-300">
                          Votes
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-dark-600 dark:text-dark-300">
                          Share
                        </th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-dark-600 dark:text-dark-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedElection.candidates.map((candidate) => {
                        const share = ((candidate.votes / selectedElection.totalVotes) * 100).toFixed(1);
                        const isWinner = candidate.name === selectedElection.winner;
                        return (
                          <tr
                            key={candidate.name}
                            className="border-b border-dark-100 dark:border-dark-800 last:border-0"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: candidate.color }}
                                />
                                <div>
                                  <span className="font-medium text-dark-900 dark:text-white text-sm">
                                    {candidate.name}
                                  </span>
                                  <p className="text-xs text-dark-400 dark:text-dark-500">
                                    {candidate.party}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right text-sm text-dark-700 dark:text-dark-300 font-medium">
                              {candidate.votes.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right text-sm text-dark-700 dark:text-dark-300">
                              {share}%
                            </td>
                            <td className="py-3 px-2 text-center">
                              {isWinner ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700 dark:text-success-400 bg-success-100 dark:bg-success-900/30 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Winner
                                </span>
                              ) : (
                                <span className="text-xs text-dark-400 dark:text-dark-500">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-500 dark:text-dark-400 font-medium">
                      Total Votes
                    </span>
                    <span className="text-dark-900 dark:text-white font-bold">
                      {selectedElection.totalVotes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
