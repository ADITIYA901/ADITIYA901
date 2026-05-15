import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Vote, Calendar, Clock, Users, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import type { Election, Candidate } from '../../types';
import { formatDate, getElectionStatus, formatNumber } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type FilterTab = 'all' | 'upcoming' | 'active' | 'ended';

interface ElectionWithCandidates extends Election {
  candidate_count?: number;
  total_votes?: number;
}

export default function ActiveElections() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<ElectionWithCandidates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

  async function fetchElections() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      const electionsData: Election[] = data || [];

      const enrichedElections = await Promise.all(
        electionsData.map(async (election) => {
          const { count: candidateCount } = await supabase
            .from('candidates')
            .select('id', { count: 'exact', head: true })
            .eq('election_id', election.id);

          const { count: voteCount } = await supabase
            .from('votes')
            .select('id', { count: 'exact', head: true })
            .eq('election_id', election.id);

          return {
            ...election,
            candidate_count: candidateCount || 0,
            total_votes: voteCount || 0,
          };
        })
      );

      setElections(enrichedElections);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredElections = elections.filter((election) => {
    const status = getElectionStatus(election.start_date, election.end_date);
    const matchesTab = activeTab === 'all' || status === activeTab;
    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'active', label: 'Active' },
    { key: 'ended', label: 'Ended' },
  ];

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming': return 'upcoming' as const;
      case 'active': return 'active' as const;
      case 'ended': return 'ended' as const;
      default: return 'info' as const;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading elections..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Active Elections</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Browse and participate in ongoing elections
        </p>
      </motion.div>

      {/* Search & Filter Tabs */}
      <motion.div variants={itemVariants} className="space-y-4">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search elections by title or description..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Elections Grid */}
      {filteredElections.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<Vote className="w-12 h-12" />}
            title="No elections found"
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'There are no elections matching the selected filter'
            }
            action={
              <Button variant="primary" onClick={() => { setActiveTab('all'); setSearchQuery(''); }}>
                View All Elections
              </Button>
            }
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElections.map((election) => {
            const status = getElectionStatus(election.start_date, election.end_date);
            return (
              <motion.div key={election.id} variants={itemVariants}>
                <Card hover className="h-full flex flex-col">
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-dark-900 dark:text-white line-clamp-2">{election.title}</h3>
                      <Badge variant={statusBadgeVariant(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2 flex-1">
                      {election.description}
                    </p>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
                      </div>

                      {/* Countdown for upcoming/active */}
                      {(status === 'upcoming' || status === 'active') && (
                        <CountdownTimer
                          targetDate={status === 'upcoming' ? election.start_date : election.end_date}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-2 border-t border-dark-200 dark:border-dark-700">
                      <div className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400">
                        <Users className="w-4 h-4" />
                        <span>{election.candidate_count || 0} Candidates</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400">
                        <Vote className="w-4 h-4" />
                        <span>{formatNumber(election.total_votes || 0)} Votes</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant={status === 'active' ? 'primary' : 'outline'}
                      size="sm"
                      icon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => navigate(`/voter/elections/${election.id}`)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
