import { User, ArrowRight } from "lucide-react";
import { Link, useNavigate } from '@tanstack/react-router';
import type { Note } from '@/db/schema';

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold tracking-wide">
    {children}
  </span>
);

export default function Home({ notes }: { notes: Note[] }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-16">
      <section className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Hi, I'm Kazui
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            情報科高校に通う学生です。<br />
            Web技術が好きで、フロントエンド開発やデザインに興味があります。
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge>TypeScript</Badge>
            <Badge>React</Badge>
            <Badge>Vite</Badge>
            <Badge>TanStack Start</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>Tauri</Badge>
            <Badge>Electron</Badge>
          </div>
        </div>
        <div className="shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* <img src="/avatar.jpg" alt="Kazui" className="w-full h-full object-cover" /> */}
            <User size={48} className="text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Recent Notes
          </h2>
          <Link 
            to="/notes" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="flex flex-col">
          {notes.map((note) => (
            <div 
              key={note.slug}
              className="group relative py-4 sm:py-5 flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 sm:hover:bg-transparent transition-colors -mx-4 px-4 sm:mx-0 sm:px-2 rounded-lg sm:rounded-none"
            >
              <div className="flex flex-wrap items-center gap-y-2">
                <time className="text-sm font-medium text-slate-500 dark:text-slate-400 w-24 shrink-0">
                  {note.publishedAt 
                    ? note.publishedAt.toLocaleDateString('ja-JP').replace(/\//g, '.') 
                    : '未公開'}   
                </time>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {note.tags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate({ to: '/notes', search: { tag: tag } });
                      }}
                      className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                <Link to="/notes/$slug" params={{ slug: note.slug }} className="before:absolute before:inset-0">
                  {note.title}
                </Link>
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}