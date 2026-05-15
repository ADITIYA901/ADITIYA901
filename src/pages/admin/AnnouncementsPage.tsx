import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import type { Announcement, Election } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface AnnouncementFormData {
  title: string;
  message: string;
  election_id: string;
}

const emptyFormData: AnnouncementFormData = {
  title: '',
  message: '',
  election_id: '',
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; announcement: Announcement | null }>({
    open: false,
    announcement: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [announcementsRes, electionsRes] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('elections').select('*').order('created_at', { ascending: false }),
      ]);

      setAnnouncements((announcementsRes.data as Announcement[]) || []);
      setElections((electionsRes.data as Election[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  }

  function getElectionTitle(electionId: string | null): string {
    if (!electionId) return 'General';
    const election = elections.find(e => e.id === electionId);
    return election?.title || 'Unknown';
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreateModal() {
    setFormData(emptyFormData);
    setFormErrors({});
    setCreateModal(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        election_id: formData.election_id || null,
        created_by: user?.id || null,
      };

      const { data, error } = await supabase.from('announcements').insert(payload).select();
      if (error) throw error;

      toast.success('Announcement created successfully');
      setCreateModal(false);
      if (data) {
        setAnnouncements(prev => [...(data as Announcement[]), ...prev]);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.announcement) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deleteModal.announcement.id);
      if (error) throw error;
      toast.success('Announcement deleted successfully');
      setAnnouncements(prev => prev.filter(a => a.id !== deleteModal.announcement!.id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    } finally {
      setIsSubmitting(false);
      setDeleteModal({ open: false, announcement: null });
    }
  }

  function truncateMessage(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + '...';
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (announcement: Announcement) => (
        <span className="font-medium text-dark-900 dark:text-white">{announcement.title}</span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (announcement: Announcement) => (
        <span className="text-dark-700 dark:text-dark-300">
          {truncateMessage(announcement.message)}
        </span>
      ),
    },
    {
      key: 'election_id',
      label: 'Election',
      render: (announcement: Announcement) => (
        <Badge variant={announcement.election_id ? 'info' : 'pending'}>
          {getElectionTitle(announcement.election_id)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (announcement: Announcement) => (
        <span className="text-dark-500 dark:text-dark-400 text-sm">
          {formatDateTime(announcement.created_at)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading announcements..." className="min-h-[60vh]" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Announcements</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Manage and create announcements</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={openCreateModal}>
          Create Announcement
        </Button>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        {announcements.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Megaphone className="w-12 h-12" />}
              title="No Announcements"
              description="Create your first announcement to notify voters."
              action={
                <Button icon={<Plus className="w-5 h-5" />} onClick={openCreateModal}>
                  Create Announcement
                </Button>
              }
            />
          </Card>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={announcements as unknown as Record<string, unknown>[]}
              searchable
              searchPlaceholder="Search announcements..."
              searchKeys={['title', 'message']}
              actions={(item) => {
                const announcement = item as unknown as Announcement;
                return (
                  <button
                    onClick={() => setDeleteModal({ open: true, announcement })}
                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500 hover:text-error-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                );
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Announcement"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            type="text"
            placeholder="Enter announcement title"
            value={formData.title}
            onChange={handleFormChange}
            error={formErrors.title}
            required
          />

          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Enter announcement message"
              value={formData.message}
              onChange={handleFormChange}
              className={formErrors.message ? 'input-field border-error-500 focus:ring-error-500/50 focus:border-error-500 resize-none' : 'input-field resize-none'}
              required
            />
            {formErrors.message && <p className="text-sm text-error-500">{formErrors.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="election_id" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
              Election (optional)
            </label>
            <select
              id="election_id"
              name="election_id"
              value={formData.election_id}
              onChange={handleFormChange}
              className="input-field"
            >
              <option value="">General (no specific election)</option>
              {elections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, announcement: null })}
        title="Delete Announcement"
      >
        <div className="flex items-start gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-error-500 shrink-0 mt-0.5" />
          <p className="text-dark-600 dark:text-dark-300">
            Are you sure you want to delete <strong>{deleteModal.announcement?.title}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, announcement: null })}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isSubmitting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
