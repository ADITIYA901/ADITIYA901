import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Eye, Square, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import type { Election } from '../../types';
import { formatDate, getElectionStatus } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ElectionManagement() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; election: Election | null }>({ open: false, election: null });
  const [endModal, setEndModal] = useState<{ open: boolean; election: Election | null }>({ open: false, election: null });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  async function fetchElections() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('elections').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setElections((data as Election[]) || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteElection() {
    if (!deleteModal.election) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('elections').delete().eq('id', deleteModal.election.id);
      if (error) throw error;
      toast.success('Election deleted successfully');
      setElections(prev => prev.filter(e => e.id !== deleteModal.election!.id));
    } catch (error) {
      console.error('Error deleting election:', error);
      toast.error('Failed to delete election');
    } finally {
      setIsProcessing(false);
      setDeleteModal({ open: false, election: null });
    }
  }

  async function handleEndElection() {
    if (!endModal.election) return;
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('elections')
        .update({ end_date: now, status: 'ended' })
        .eq('id', endModal.election.id);
      if (error) throw error;
      toast.success('Election ended successfully');
      setElections(prev =>
        prev.map(e => e.id === endModal.election!.id ? { ...e, end_date: now, status: 'ended' as const } : e)
      );
    } catch (error) {
      console.error('Error ending election:', error);
      toast.error('Failed to end election');
    } finally {
      setIsProcessing(false);
      setEndModal({ open: false, election: null });
    }
  }

  function getStatusBadgeVariant(status: string): 'upcoming' | 'active' | 'ended' {
    if (status === 'upcoming') return 'upcoming';
    if (status === 'active') return 'active';
    return 'ended';
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (election: Election) => (
        <span className="font-medium text-dark-900 dark:text-white">{election.title}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (election: Election) => {
        const status = getElectionStatus(election.start_date, election.end_date);
        return <Badge variant={getStatusBadgeVariant(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
      },
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (election: Election) => formatDate(election.start_date),
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (election: Election) => formatDate(election.end_date),
    },
    {
      key: 'candidates',
      label: 'Candidates',
      render: (election: Election) => {
        const count = election.candidates_count ?? '—';
        return <span>{count}</span>;
      },
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading elections..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Election Management</h1>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => navigate('/admin/elections/create')}>
          Create Election
        </Button>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        {elections.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Plus className="w-12 h-12" />}
              title="No Elections Yet"
              description="Create your first election to get started with the voting system."
              action={
                <Button icon={<Plus className="w-5 h-5" />} onClick={() => navigate('/admin/elections/create')}>
                  Create Election
                </Button>
              }
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={elections as unknown as Record<string, unknown>[]}
              searchable
              searchPlaceholder="Search elections..."
              searchKeys={['title', 'status']}
              onRowClick={(item) => navigate(`/admin/elections/${(item as unknown as Election).id}`)}
              actions={(item) => {
                const election = item as unknown as Election;
                const status = getElectionStatus(election.start_date, election.end_date);
                return (
                  <>
                    <button
                      onClick={() => navigate(`/admin/elections/${election.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-500"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/elections/${election.id}`)}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-500"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {status === 'active' && (
                      <button
                        onClick={() => setEndModal({ open: true, election })}
                        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-warning-500"
                        title="End Election"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal({ open: true, election })}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-error-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                );
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, election: null })} title="Delete Election">
        <p className="text-dark-600 dark:text-dark-300 mb-6">
          Are you sure you want to delete <strong>{deleteModal.election?.title}</strong>? This action cannot be undone and all associated data will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, election: null })}>Cancel</Button>
          <Button variant="danger" isLoading={isProcessing} onClick={handleDeleteElection}>Delete</Button>
        </div>
      </Modal>

      {/* End Election Confirmation Modal */}
      <Modal isOpen={endModal.open} onClose={() => setEndModal({ open: false, election: null })} title="End Election">
        <p className="text-dark-600 dark:text-dark-300 mb-6">
          Are you sure you want to end <strong>{endModal.election?.title}</strong>? This will immediately stop all voting and finalize the results.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEndModal({ open: false, election: null })}>Cancel</Button>
          <Button variant="danger" isLoading={isProcessing} onClick={handleEndElection}>End Election</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
