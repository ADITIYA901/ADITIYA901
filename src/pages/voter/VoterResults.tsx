import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { VotePieChart } from '../../components/ui/Charts';
import type { Election, ElectionResult } from '../../types';
import { formatDate, getElectionStatus, formatNumber, getPercentage } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VoterResults() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  async function fetchElections() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('end_date', { ascending: false });

      if (error) throw error;

      const allElections: Election[] = data || [];
      setElections(allElections);

      // Auto-select first ended election
      const endedElections = allElections.filter(
        e => getElectionStatus(e.start_date, e.end_date) === 'ended'
      );
      if (endedElections.length > 0) {
        setSelectedElectionId(endedElections[0].id);
        fetchResults(endedElections[0].id);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchResults(electionId: string) {
    setIsLoadingResults(true);
    setResults([]);
    try {
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('id, name, party')
        .eq('election_id', electionId);

      if (!candidatesData) {
        setResults([]);
        setIsLoadingResults(false);
        return;
      }

      const resultsWithVotes = await Promise.all(
        candidatesData.map(async (c) => {
          const { count } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: true })
            .eq('candidate_id', c.id)
            .eq('election_id', electionId);
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

      setResults(computedResults.sort((a, b) => b.vote_count - a.vote_count));
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setIsLoadingResults(false);
    }
  }

  function handleElectionChange(electionId: string) {
    setSelectedElectionId(electionId);
    if (electionId) {
      fetchResults(electionId);
    } else {
      setResults([]);
    }
  }

  const selectedElection = elections.find(e => e.id === selectedElectionId);
  const selectedElectionStatus = selectedElection
    ? getElectionStatus(selectedElection.start_date, selectedElection.end_date)
    : null;
  const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);
  const winner = results.length > 0 ? results[0] : null;
  const pieData = results.map(r => ({ name: r.candidate_name, value: r.vote_count }));

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading results..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Election Results</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          View results for completed elections
        </p>
      </motion.div>

      {/* Election Selector */}
      <motion.div variants={itemVariants}>
        <Card>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Select Election
          </label>
          <div className="relative">
            <select
              value={selectedElectionId}
              onChange={(e) => handleElectionChange(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="">Choose an election...</option>
              {elections.map((election) => {
                const status = getElectionStatus(election.start_date, election.end_date);
                return (
                  <option key={election.id} value={election.id}>
                    {election.title} ({status.charAt(0).toUpperCase() + status.slice(1)})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
          </div>
        </Card>
      </motion.div>

      {/* No election selected */}
      {!selectedElectionId && (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<BarChart3 className="w-12 h-12" />}
            title="Select an election"
            description="Choose an election from the dropdown to view its results"
          />
        </motion.div>
      )}

      {/* Active election - results not available */}
      {selectedElectionId && selectedElectionStatus === 'active' && (
        <motion.div variants={itemVariants}>
          <Card className="border-warning-200 dark:border-warning-800">
            <div className="flex items-center gap-3 py-4">
              <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/30">
                <AlertCircle className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-white">Results not yet available</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                  This election is still active. Results will be available after it ends on {selectedElection && formatDate(selectedElection.end_date)}.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Upcoming election */}
      {selectedElectionId && selectedElectionStatus === 'upcoming' && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-3 py-4">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <AlertCircle className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-white">Election hasn't started</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                  This election opens on {selectedElection && formatDate(selectedElection.start_date)}. No results available yet.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Ended election - show results */}
      {selectedElectionId && selectedElectionStatus === 'ended' && (
        <>
          {isLoadingResults ? (
            <LoadingSpinner size="md" text="Loading results..." className="py-12" />
          ) : (
            <>
              {/* Winner Announcement */}
              {winner && (
                <motion.div variants={itemVariants}>
                  <Card gradient>
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-warning-100 dark:bg-warning-900/30 mb-4">
                        <Trophy className="w-8 h-8 text-warning-500" />
                      </div>
                      <h2 className="text-xl font-bold text-dark-900 dark:text-white">Winner</h2>
                      <p className="text-2xl font-bold gradient-text mt-2">{winner.candidate_name}</p>
                      <p className="text-sm text-dark-500 dark:text-dark-400">{winner.party}</p>
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{winner.percentage}%</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">Vote Share</p>
                        </div>
                        <div className="w-px h-10 bg-dark-200 dark:bg-dark-700" />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success-600 dark:text-success-400">{formatNumber(winner.vote_count)}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">Votes</p>
                        </div>
                      </div>
                      <p className="text-xs text-dark-400 dark:text-dark-500 mt-4">
                        Total votes cast: {formatNumber(totalVotes)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Vote Distribution & Breakdown */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Vote Distribution</h3>
                  {pieData.length > 0 ? (
                    <>
                      <VotePieChart data={pieData} height={300} />
                      <p className="text-sm text-dark-500 dark:text-dark-400 text-center mt-3">
                        Total votes: {formatNumber(totalVotes)}
                      </p>
                    </>
                  ) : (
                    <p className="text-center text-dark-500 dark:text-dark-400 py-8">No votes recorded</p>
                  )}
                </Card>

                {/* Candidate Breakdown Table */}
                <Card>
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Candidate Breakdown</h3>
                  {results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-200 dark:border-dark-700">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Rank</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Candidate</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Party</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">Votes</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                          {results.map((result, index) => (
                            <tr key={result.candidate_id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                              <td className="px-3 py-3 text-sm">
                                {index === 0 ? (
                                  <Trophy className="w-4 h-4 text-warning-500" />
                                ) : (
                                  <span className="text-dark-500 dark:text-dark-400">{index + 1}</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-sm font-medium text-dark-900 dark:text-white">{result.candidate_name}</td>
                              <td className="px-3 py-3 text-sm text-dark-500 dark:text-dark-400">{result.party}</td>
                              <td className="px-3 py-3 text-sm text-right font-medium text-dark-900 dark:text-white">{formatNumber(result.vote_count)}</td>
                              <td className="px-3 py-3 text-sm text-right">
                                <Badge variant={index === 0 ? 'success' : 'info'}>{result.percentage}%</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-dark-500 dark:text-dark-400 py-8">No votes recorded</p>
                  )}
                </Card>
              </motion.div>
            </>
          )}
        </>
      )}
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
