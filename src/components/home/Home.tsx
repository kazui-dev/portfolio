import { User } from "lucide-react";

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold tracking-wide">
    {children}
  </span>
);

export default function Home() {
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

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
          Recent Notes
        </h2>
        
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            投稿はまだありません。
          </p>
        </div>
      </section>

    </div>
  );
}