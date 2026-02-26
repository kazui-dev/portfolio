import { cn } from "@/lib/utils";
import { useState, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { X, Filter, ArrowUpDown } from 'lucide-react';
import { Select } from '@/components/ui/select';
import type { Note } from '@/db/schema';

export default function Notes({ selectedTag, initialNotes }: { selectedTag?: string, initialNotes?: Note[] }) {
  const navigate = useNavigate({ from: '/notes/' });
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const currentTags = useMemo(() => {
    if (!selectedTag) return [];
    return selectedTag.split('-').filter(Boolean);
  }, [selectedTag]);

  const allTags = useMemo(() => {
    return Array.from(new Set(initialNotes?.flatMap(note => note.tags) || []));
  }, [initialNotes]);

  const tagOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Tags', exclusive: true },
      ...allTags.map(tag => ({ value: tag, label: tag }))
    ];
  }, [allTags]);

  const sortOptions = [
    { value: 'desc', label: 'Newest' },
    { value: 'asc', label: 'Oldest' }
  ];

  const processedNotes = useMemo(() => {
    if (!initialNotes) return [];
    const filtered = currentTags.length > 0 
      ? initialNotes.filter(n => currentTags.every(t => n.tags.includes(t))) 
      : initialNotes;
    
    return [...filtered].sort((a, b) => {
      const timeA = a.publishedAt?.getTime() || 0;
      const timeB = b.publishedAt?.getTime() || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [currentTags, sortOrder, initialNotes]);

  const handleTagChange = (values: string[]) => {
    if (values.includes('all') || values.length === 0) {
      navigate({ search: { tag: undefined } });
    } else {
      navigate({ search: { tag: values.join('-') } });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(t => t !== tagToRemove);
    navigate({ search: { tag: newTags.length > 0 ? newTags.join('-') : undefined } });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Notes
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          技術的な活動や学びを記録していきます。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        
        <div className="w-37.5">
          <Select 
            options={tagOptions}
            value={currentTags.length > 0 ? currentTags : ['all']}
            onChange={handleTagChange}
            multiple={true}
            icon={<Filter size={14} />}
          />
        </div>

        <div className="w-32.5">
          <Select 
            options={sortOptions}
            value={sortOrder}
            onChange={(val) => setSortOrder(val as 'desc' | 'asc')}
            multiple={false}
            icon={<ArrowUpDown size={14} />}
          />
        </div>

        {currentTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 ml-1 sm:ml-2">
            <span className="text-sm font-medium text-slate-500">Filtered by:</span>
            {currentTags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-50 dark:bg-slate-200 dark:text-slate-900"
              >
                #{tag}
                <button 
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 focus:outline-none hover:text-red-300 dark:hover:text-red-600 transition-colors"
                  aria-label={`Remove ${tag} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        {processedNotes.length > 0 ? (
          processedNotes.map((note) => (
            <div 
              key={note.slug}
              className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all h-full"
            >
              <div className="space-y-2 mb-4">
                <time className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  {note.publishedAt 
                    ? note.publishedAt.toLocaleDateString('ja-JP').replace(/\//g, '.') 
                    : '未公開'}                </time>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors line-clamp-3">
                  <Link to="/notes/$slug" params={{ slug: note.slug }} className="before:absolute before:inset-0">
                    {note.title}
                  </Link>
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50 relative z-10">
                {note.tags.map(tag => {
                  const isSelected = currentTags.includes(tag);
                  return (
                  <button 
                    key={tag}
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentTags.includes(tag)) {
                        removeTag(tag);
                      } else {
                        navigate({ search: { tag: [...currentTags, tag].join('-') } });                      
                      }
                    }}
                    className={cn(
                      "text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full transition-colors focus:outline-none",
                      isSelected
                        ? "bg-slate-700 text-slate-50 hover:bg-slate-600 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
                        : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}                  >
                    #{tag}
                  </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            ノートが見つかりませんでした。
          </div>
        )}
      </div>
    </div>
  )
}