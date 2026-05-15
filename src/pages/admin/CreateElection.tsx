import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface FormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface FormErrors {
  title?: string;
  end_date?: string;
}

export default function CreateElection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const status = new Date(formData.start_date) > new Date() ? 'upcoming' : 'active';

      const { error } = await supabase.from('elections').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success('Election created successfully');
      navigate('/admin/elections');
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Create Election</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Set up a new election for the voting system.</p>
      </motion.div>

      {/* Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Election Title"
              name="title"
              type="text"
              placeholder="Enter election title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter election description"
                value={formData.description}
                onChange={handleChange}
                className="input-field resize-none"
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="start_date" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Start Date
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="end_date" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  End Date
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={errors.end_date ? 'input-field border-error-500 focus:ring-error-500/50 focus:border-error-500' : 'input-field'}
                  required
                />
                {errors.end_date && <p className="text-sm text-error-500">{errors.end_date}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
              <Button variant="outline" onClick={() => navigate('/admin/elections')} icon={<X className="w-5 h-5" />}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} icon={<Save className="w-5 h-5" />}>
                Create Election
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
