import { Sun, MoonStar, Smartphone, Monitor, Check } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/lib/theme';

const SystemIcon = ({ className, size }: { className?: string, size?: number }) => (
  <>
    <Smartphone size={size} className={`md:hidden ${className || ''}`} />
    <Monitor size={size} className={`hidden md:block ${className || ''}`} />
  </>
);

export default function ThemeSelector() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 p-0 hover:bg-slate-200/50 active:bg-slate-200/50 dark:hover:bg-slate-800/50 dark:active:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors [&_svg]:size-5"
          aria-label="テーマ切り替え"
        >
          {resolvedTheme === 'dark' ? (
            <MoonStar size={20} />
          ) : (
            <Sun size={20} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 z-60" side="bottom">
        <div className="space-y-1">
          {[
            { themeValue: 'light' as const, icon: Sun, label: 'ライトモード' },
            { themeValue: 'dark' as const, icon: MoonStar, label: 'ダークモード' },
            { themeValue: 'system' as const, icon: SystemIcon, label: '端末の設定を使う' },
          ].map(({ themeValue, icon: Icon, label }) => (
            <button
              key={themeValue}
              onClick={() => setTheme(themeValue)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 active:bg-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-800 transition-colors"
              aria-current={theme === themeValue ? 'true' : undefined}
            >
              <Icon size={18} className="text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1 text-left">{label}</span>
              {theme === themeValue && <Check size={16} className="text-slate-600 dark:text-slate-300" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}