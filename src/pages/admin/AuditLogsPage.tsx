import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { AuditLog } from '../../types';
import { formatDateTime } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type UserTypeFilter = 'all' | 'admin' | 'voter';

const ACTION_COLORS: Record<string, 'info' | 'success' | 'warning' | 'error' | 'pending'> = {
  login: 'info',
  vote: 'success',
  create: 'pending',
  delete: 'error',
  update: 'warning',
  logout: 'info',
  register: 'success',
  approve: 'success',
  reject: 'error',
  end: 'warning',
  start: 'success',
};

function getActionBadgeVariant(action: string): 'info' | 'success' | 'warning' | 'error' | 'pending' {
  const lowerAction = action.toLowerCase();
  for (const [key, variant] of Object.entries(ACTION_COLORS)) {
    if (lowerAction.includes(key)) return variant;
  }
  return 'info';
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchLogs();
  }, [page, userTypeFilter, actionFilter, fromDate, toDate]);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (userTypeFilter !== 'all') {
        query = query.eq('user_type', userTypeFilter);
      }
      if (actionFilter) {
        query = query.ilike('action', `%${actionFilter}%`);
      }
      if (fromDate) {
        query = query.gte('timestamp', new Date(fromDate).toISOString());
      }
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('timestamp', endOfDay.toISOString());
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setLogs((data as AuditLog[]) || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }

  function exportCSV() {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'User Type', 'Action', 'Details'];
    const rows = logs.map(log => [
      formatDateTime(log.timestamp),
      log.user_type,
      log.action,
      log.details.replace(/,/g, ';'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  }

  const actionTypes = [
    'Login',
    'Logout',
    'Vote',
    'Create',
    'Update',
    'Delete',
    'Register',
    'Approve',
    'Reject',
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Audit Logs</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Track all system activities</p>
        </div>
        <Button
          icon={<Download className="w-5 h-5" />}
          variant="outline"
          onClick={exportCSV}
          disabled={logs.length === 0}
        >
          Export Logs
        </Button>
      </motion.div>

      {/* Filter Row */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-dark-500" />
            <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300 uppercase tracking-wider">
              Filters
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="from-date" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                From Date
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="to-date" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                To Date
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-type-filter" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                User Type
              </label>
              <select
                id="user-type-filter"
                value={userTypeFilter}
                onChange={(e) => { setUserTypeFilter(e.target.value as UserTypeFilter); setPage(1); }}
                className="input-field"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="voter">Voter</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="action-filter" className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                Action
              </label>
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="input-field"
              >
                <option value="">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action.toLowerCase()}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading logs..." className="min-h-[30vh]" />
        ) : logs.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No Audit Logs"
              description="No logs match your current filters. Try adjusting the filter criteria."
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto rounded-xl border border-dark-200 dark:border-dark-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-50 dark:bg-dark-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                  {logs.map(log => (
                    <tr
                      key={log.id}
                      className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={log.user_type === 'admin' ? 'info' : 'success'}>
                          {log.user_type === 'admin' ? 'Admin' : 'Voter'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
