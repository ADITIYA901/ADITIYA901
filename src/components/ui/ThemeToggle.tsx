import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-300"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 text-warning-500 absolute inset-0 transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
        <Moon className={`w-5 h-5 text-primary-400 absolute inset-0 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
      </div>
    </button>
  );
}
