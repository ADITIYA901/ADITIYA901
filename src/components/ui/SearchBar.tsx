import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export default function SearchBar({ onSearch, placeholder = 'Search...', className, debounceMs = 300 }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(value), debounceMs);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        >
          <X className="w-4 h-4 text-dark-400" />
        </button>
      )}
    </div>
  );
}
