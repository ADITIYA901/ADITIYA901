import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Download, Award, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/ui/Card';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { VotePieChart, VoteBarChart } from '../../components/ui/Charts';
import type { Election, Candidate, Vote, ElectionResult } from '../../types';
import { formatDate, formatNumber, getPercentage } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ResultsPage() {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchResults();
    }
  }, [selectedElectionId]);

  async function fetchElections() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const electionData = (data as Election[]) || [];
      setElections(electionData);
      if (electionData.length > 0) {
        const endedElections = electionData.filter(e => e.status === 'ended');
        if (endedElections.length > 0) {
          setSelectedElectionId(endedElections[0].id);
        } else {
          setSelectedElectionId(electionData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchResults() {
    if (!selectedElectionId) return;
    setIsLoading(true);
    try {
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, name, party')
        .eq('election_id', selectedElectionId);

      if (candidatesError) throw candidatesError;

      const candidates = candidatesData || [];
      if (candidates.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const candidatesWithVotes = await Promise.all(
        candidates.map(async (c) => {
          const { count, error: voteError } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: true })
            .eq('candidate_id', c.id);

          if (voteError) throw voteError;
          return {
            candidate_id: c.id,
            candidate_name: c.name,
            party: c.party,
            vote_count: count || 0,
          };
        })
      );

      const totalVotes = candidatesWithVotes.reduce((sum, c) => sum + c.vote_count, 0);
      const resultsWithPercentage: ElectionResult[] = candidatesWithVotes
        .sort((a, b) => b.vote_count - a.vote_count)
        .map(c => ({
          ...c,
          percentage: getPercentage(c.vote_count, totalVotes),
        }));

      setResults(resultsWithPercentage);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load election results');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedElection = useMemo(() => {
    return elections.find(e => e.id === selectedElectionId);
  }, [elections, selectedElectionId]);

  const winner = useMemo(() => {
    return results.length > 0 ? results[0] : null;
  }, [results]);

  const totalVotes = useMemo(() => {
    return results.reduce((sum, r) => sum + r.vote_count, 0);
  }, [results]);

  const pieData = useMemo(() => {
    return results.map(r => ({
      name: r.candidate_name,
      value: r.vote_count,
    }));
  }, [results]);

  const barData = useMemo(() => {
    return results.map(r => ({
      name: r.candidate_name,
      votes: r.vote_count,
    }));
  }, [results]);

  async function exportPDF() {
    if (!selectedElection || results.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BlockVote Election Results', 14, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(selectedElection.title, 14, 30);

      doc.setFontSize(10);
      doc.text(`Date: ${formatDate(selectedElection.start_date)} - ${formatDate(selectedElection.end_date)}`, 14, 38);
      doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 14, 44);

      // Winner
      if (winner) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Winner', 14, 56);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`${winner.candidate_name} (${winner.party})`, 14, 64);
        doc.text(`Votes: ${winner.vote_count} (${winner.percentage}%)`, 14, 72);
      }

      // Results Table
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Results', 14, 86);

      const tableStartY = 94;
      const colWidths = [12, 50, 40, 30, 30, 28];
      const headers = ['Rank', 'Candidate', 'Party', 'Votes', '%', 'Status'];

      // Table Header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      let x = 14;
      headers.forEach((h, i) => {
        doc.text(h, x, tableStartY);
        x += colWidths[i];
      });

      // Table Rows
      doc.setFont('helvetica', 'normal');
      results.forEach((result, index) => {
        const y = tableStartY + 8 + index * 7;
        const row = [
          String(index + 1),
          result.candidate_name,
          result.party,
          String(result.vote_count),
          `${result.percentage}%`,
          index === 0 ? 'Winner' : index === 1 ? 'Runner-up' : '',
        ];
        x = 14;
        row.forEach((cell, i) => {
          doc.text(cell, x, y);
          x += colWidths[i];
        });
      });

      // Total Votes
      const totalY = tableStartY + 8 + results.length * 7 + 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Votes: ${totalVotes}`, 14, totalY);

      doc.save(`${selectedElection.title.replace(/\s+/g, '_')}_Results.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading && elections.length === 0) {
    return <LoadingSpinner size="lg" text="Loading results..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Election Results</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">View and export election results</p>
        </div>
        <Button
          icon={<Download className="w-5 h-5" />}
          onClick={exportPDF}
          isLoading={isExporting}
          disabled={!selectedElectionId || results.length === 0}
        >
          Export PDF
        </Button>
      </motion.div>

      {/* Election Selector */}
      <motion.div variants={itemVariants}>
        <label htmlFor="election-selector" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
          Select Election
        </label>
        <select
          id="election-selector"
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          className="input-field max-w-md"
        >
          <option value="">-- Select an election --</option>
          {elections.map(election => (
            <option key={election.id} value={election.id}>
              {election.title}
            </option>
          ))}
        </select>
      </motion.div>

      {!selectedElectionId ? (
        <Card>
          <EmptyState
            icon={<BarChart3 className="w-12 h-12" />}
            title="No Election Selected"
            description="Select an election to view results."
          />
        </Card>
      ) : isLoading ? (
        <LoadingSpinner size="lg" text="Loading results..." className="min-h-[30vh]" />
      ) : results.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BarChart3 className="w-12 h-12" />}
            title="No Results Yet"
            description="No votes have been cast in this election yet."
          />
        </Card>
      ) : (
        <>
          {/* Winner Announcement Card */}
          {winner && (
            <motion.div variants={itemVariants}>
              <Card gradient className="relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-6 h-6 text-warning-500" />
                    <span className="text-sm font-semibold text-warning-600 dark:text-warning-400 uppercase tracking-wider">
                      Winner
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-dark-900 dark:text-white">
                    {winner.candidate_name}
                  </h2>
                  <p className="text-dark-600 dark:text-dark-300 mt-1">{winner.party}</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <p className="text-2xl font-bold text-dark-900 dark:text-white">
                        {formatNumber(winner.vote_count)}
                      </p>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Votes</p>
                    </div>
                    <div className="w-px h-10 bg-dark-200 dark:bg-dark-700" />
                    <div>
                      <p className="text-2xl font-bold text-dark-900 dark:text-white">
                        {winner.percentage}%
                      </p>
                      <p className="text-sm text-dark-500 dark:text-dark-400">Vote Share</p>
                    </div>
                  </div>
                </div>
                {/* Confetti-like decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-warning-500" />
                  <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-primary-500" />
                  <div className="absolute top-2 right-20 w-4 h-4 rounded-full bg-success-500" />
                  <div className="absolute top-12 right-6 w-2 h-2 rounded-full bg-accent-500" />
                  <div className="absolute top-16 right-16 w-3 h-3 rounded-full bg-warning-500" />
                  <div className="absolute top-6 right-24 w-2 h-2 rounded-full bg-error-500" />
                  <div className="absolute top-20 right-8 w-4 h-4 rounded-full bg-primary-500" />
                  <div className="absolute top-14 right-2 w-2 h-2 rounded-full bg-success-500" />
                  <div className="absolute top-24 right-10 w-3 h-3 rounded-full bg-accent-500" />
                  <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-warning-500" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Charts Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Vote Distribution</h3>
              <VotePieChart data={pieData} height={300} />
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Votes per Candidate</h3>
              <VoteBarChart data={barData} height={300} />
            </Card>
          </motion.div>

          {/* Detailed Results Table */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Detailed Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-50 dark:bg-dark-800/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Party
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Votes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                    {results.map((result, index) => (
                      <tr
                        key={result.candidate_id}
                        className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-dark-900 dark:text-white">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-dark-900 dark:text-white">
                            {result.candidate_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                          {result.party}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-dark-900 dark:text-white">
                          {formatNumber(result.vote_count)}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                style={{ width: `${result.percentage}%` }}
                              />
                            </div>
                            <span className="text-dark-500 dark:text-dark-400">{result.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {index === 0 ? (
                            <Badge variant="success">
                              <Trophy className="w-3 h-3 mr-1" /> Winner
                            </Badge>
                          ) : index === 1 ? (
                            <Badge variant="info">
                              <Award className="w-3 h-3 mr-1" /> Runner-up
                            </Badge>
                          ) : (
                            <Badge variant="pending">Participated</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Total Votes: <span className="font-semibold text-dark-900 dark:text-white">{formatNumber(totalVotes)}</span>
                </p>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
