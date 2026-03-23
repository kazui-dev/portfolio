import { useState, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { X, Filter, ArrowUpDown } from 'lucide-react';
import { Select } from '@/components/ui/select';
import NoteGrid from '@/components/notes/NoteGrid';
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
    // unlisted記事は除外
    const visibleNotes = initialNotes.filter(n => !n.isUnlisted);
    const filtered = currentTags.length > 0 
      ? visibleNotes.filter(n => currentTags.every(t => n.tags.includes(t))) 
      : visibleNotes;
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
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Notes
        </h1>
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
                  className="ml-0.5 focus:outline-none hover:text-slate-300 dark:hover:text-slate-400 transition-colors"
                  aria-label={`Remove ${tag} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <NoteGrid
        notes={processedNotes}
        currentTags={currentTags}
        onTagToggle={(tag) => {
          if (currentTags.includes(tag)) {
            removeTag(tag);
          } else {
            navigate({ search: { tag: [...currentTags, tag].join('-') } });
          }
        }}
        renderNoteLink={(note, children) => (
          <Link to="/notes/$slug" params={{ slug: note.slug }} className="before:absolute before:inset-0">
            {children}
          </Link>
        )}
      />
    </div>
  )
}