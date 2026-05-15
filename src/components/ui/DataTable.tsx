import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  actions?: (item: T) => ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found',
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const keys = searchKeys || columns.map(c => c.key);
    return keys.some(key => {
      const val = item[key];
      return String(val).toLowerCase().includes(search.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="input-field pl-10"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-dark-200 dark:border-dark-700">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-50 dark:bg-dark-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-dark-700 dark:hover:text-dark-200 transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-dark-500 dark:text-dark-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
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
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    page === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
                  )}
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
    </div>
  );
}
