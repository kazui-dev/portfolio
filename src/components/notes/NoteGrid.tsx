import { cn } from '@/lib/utils';
import type { Note } from '@/db/schema';

type NoteGridProps = {
  notes: Note[];
  currentTags: string[];
  onTagToggle: (tag: string) => void;
  renderNoteLink: (note: Note, children: React.ReactNode) => React.ReactNode;
  renderNoteActions?: (note: Note) => React.ReactNode;
  showStatus?: boolean;
};

export default function NoteGrid({
  notes,
  currentTags,
  onTagToggle,
  renderNoteLink,
  renderNoteActions,
  showStatus,
}: NoteGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
      {notes.length > 0 ? (
        notes.map((note) => (
          <div
            key={note.id}
            className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all h-full"
          >
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-1 flex-wrap">
                <time className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  {note.publishedAt
                    ? note.publishedAt.toLocaleDateString('ja-JP').replace(/\//g, '.')
                    : '未公開'}
                </time>
                {showStatus && (
                  <>
                    <span
                      className={cn(
                        'text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded',
                        note.isPublished
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      )}
                    >
                      {note.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {note.isUnlisted && note.isPublished && (
                      <span
                        className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                      >
                        Unlisted
                      </span>
                    )}
                  </>
                )}
                {renderNoteActions?.(note)}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors line-clamp-3">
                {renderNoteLink(note, note.title)}
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50 relative z-10">
              {note.tags.map((tag) => {
                const isSelected = currentTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.preventDefault();
                      onTagToggle(tag);
                    }}
                    className={cn(
                      'text-[10px] font-bold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full transition-colors focus:outline-none',
                      isSelected
                        ? 'bg-slate-700 text-slate-50 hover:bg-slate-600 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300'
                        : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
                    )}
                  >
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
  );
}
