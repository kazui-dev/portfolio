import { Link } from '@tanstack/react-router';
import { House, NotebookText } from 'lucide-react';

export default function MobilePageNav() {
  return (
    <nav className="grid md:hidden w-24 sm:w-28 grid-cols-2 h-9 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-md text-slate-500 dark:text-slate-400">
      <Link
        to="/"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm h-full px-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
        activeProps={{ className: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50' }}
        activeOptions={{ exact: true, includeSearch: false }}
        aria-label="Home"
      >
        <House size={16} />
      </Link>
      <Link
        to="/notes"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm h-full px-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
        activeProps={{ className: 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50' }}
        activeOptions={{ exact: false, includeSearch: false }}
        aria-label="Notes"
      >
        <NotebookText size={16} />
      </Link>
    </nav>
  );
}