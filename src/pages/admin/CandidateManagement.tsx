import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import type { Candidate, Election } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface CandidateFormData {
  name: string;
  party: string;
  photo_url: string;
  symbol_url: string;
  description: string;
  election_id: string;
}

const emptyFormData: CandidateFormData = {
  name: '',
  party: '',
  photo_url: '',
  symbol_url: '',
  description: '',
  election_id: '',
};

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>('all');

  // Add/Edit modal
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; candidate: Candidate | null }>({
    open: false,
    mode: 'add',
    candidate: null,
  });
  const [formData, setFormData] = useState<CandidateFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; candidate: Candidate | null }>({
    open: false,
    candidate: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [candidatesRes, electionsRes] = await Promise.all([
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('elections').select('*').order('created_at', { ascending: false }),
      ]);

      setCandidates((candidatesRes.data as Candidate[]) || []);
      setElections((electionsRes.data as Election[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  }

  function getElectionTitle(electionId: string): string {
    const election = elections.find(e => e.id === electionId);
    return election?.title || 'Unknown';
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.election_id) errors.election_id = 'Election is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openAddModal() {
    setFormData(emptyFormData);
    setFormErrors({});
    setFormModal({ open: true, mode: 'add', candidate: null });
  }

  function openEditModal(candidate: Candidate) {
    setFormData({
      name: candidate.name,
      party: candidate.party,
      photo_url: candidate.photo_url || '',
      symbol_url: candidate.symbol_url || '',
      description: candidate.description || '',
      election_id: candidate.election_id,
    });
    setFormErrors({});
    setFormModal({ open: true, mode: 'edit', candidate });
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        party: formData.party.trim(),
        photo_url: formData.photo_url.trim() || null,
        symbol_url: formData.symbol_url.trim() || null,
        description: formData.description.trim() || null,
        election_id: formData.election_id,
      };

      if (formModal.mode === 'add') {
        const { error } = await supabase.from('candidates').insert(payload);
        if (error) throw error;
        toast.success('Candidate added successfully');
      } else {
        const { error } = await supabase
          .from('candidates')
          .update(payload)
          .eq('id', formModal.candidate!.id);
        if (error) throw error;
        toast.success('Candidate updated successfully');
      }

      setFormModal({ open: false, mode: 'add', candidate: null });
      fetchData();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error(`Failed to ${formModal.mode === 'add' ? 'add' : 'update'} candidate`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.candidate) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', deleteModal.candidate.id);
      if (error) throw error;
      toast.success('Candidate deleted successfully');
      setCandidates(prev => prev.filter(c => c.id !== deleteModal.candidate!.id));
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setIsSubmitting(false);
      setDeleteModal({ open: false, candidate: null });
    }
  }

  const filteredCandidates = selectedElection === 'all'
    ? candidates
    : candidates.filter(c => c.election_id === selectedElection);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (candidate: Candidate) => (
        <div className="flex items-center gap-3">
          <Avatar src={candidate.photo_url} name={candidate.name} size="sm" />
          <span className="font-medium text-dark-900 dark:text-white">{candidate.name}</span>
        </div>
      ),
    },
    {
      key: 'party',
      label: 'Party',
      sortable: true,
      render: (candidate: Candidate) => (
        <span className="text-dark-700 dark:text-dark-300">{candidate.party || '—'}</span>
      ),
    },
    {
      key: 'election_id',
      label: 'Election',
      render: (candidate: Candidate) => (
        <span className="text-dark-700 dark:text-dark-300">{getElectionTitle(candidate.election_id)}</span>
      ),
    },
    {
      key: 'photo_url',
      label: 'Photo',
      render: (candidate: Candidate) => (
        <Avatar src={candidate.photo_url} name={candidate.name} size="sm" />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading candidates..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Candidate Management</h1>
        <Button icon={<Plus className="w-5 h-5" />} onClick={openAddModal}>
          Add Candidate
        </Button>
      </motion.div>

      {/* Election Filter */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <label htmlFor="election-filter" className="text-sm font-medium text-dark-700 dark:text-dark-300">
            Filter by Election:
          </label>
          <select
            id="election-filter"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Elections</option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        {filteredCandidates.length === 0 ? (
          <Card>
            <EmptyState
              icon={<UserPlus className="w-12 h-12" />}
              title="No Candidates Yet"
              description="Add candidates to your elections to get started."
              action={
                <Button icon={<Plus className="w-5 h-5" />} onClick={openAddModal}>
                  Add Candidate
                </Button>
              }
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={filteredCandidates as unknown as Record<string, unknown>[]}
              searchable
              searchPlaceholder="Search candidates..."
              searchKeys={['name', 'party']}
              actions={(item) => {
                const candidate = item as unknown as Candidate;
                return (
                  <>
                    <button
                      onClick={() => openEditModal(candidate)}
                      className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-primary-500"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, candidate })}
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

      {/* Add/Edit Candidate Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, mode: 'add', candidate: null })}
        title={formModal.mode === 'add' ? 'Add Candidate' : 'Edit Candidate'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            type="text"
            placeholder="Enter candidate name"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />

          <Input
            label="Party"
            name="party"
            type="text"
            placeholder="Enter party name"
            value={formData.party}
            onChange={handleFormChange}
          />

          <Input
            label="Photo URL"
            name="photo_url"
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={formData.photo_url}
            onChange={handleFormChange}
          />

          <Input
            label="Symbol URL"
            name="symbol_url"
            type="url"
            placeholder="https://example.com/symbol.png"
            value={formData.symbol_url}
            onChange={handleFormChange}
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter candidate description"
              value={formData.description}
              onChange={handleFormChange}
              className="input-field resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="election_id" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Election
            </label>
            <select
              id="election_id"
              name="election_id"
              value={formData.election_id}
              onChange={handleFormChange}
              className={formErrors.election_id ? 'input-field border-error-500 focus:ring-error-500/50 focus:border-error-500' : 'input-field'}
              required
            >
              <option value="">Select an election</option>
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title}
                </option>
              ))}
            </select>
            {formErrors.election_id && <p className="text-sm text-error-500">{formErrors.election_id}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <Button
              variant="outline"
              onClick={() => setFormModal({ open: false, mode: 'add', candidate: null })}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {formModal.mode === 'add' ? 'Add Candidate' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, candidate: null })} title="Delete Candidate">
        <p className="text-dark-600 dark:text-dark-300 mb-6">
          Are you sure you want to delete <strong>{deleteModal.candidate?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, candidate: null })}>Cancel</Button>
          <Button variant="danger" isLoading={isSubmitting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
