// shadcn/uiのSelectを参考に、複数選択と排他選択（Allなど）に対応したカスタムSelectコンポーネントを作成
// これをNotes.tsxのタグフィルターに使う
import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string;
  label: string;
  exclusive?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  icon,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (option: SelectOption) => {
    if (!multiple) {
      onChange(option.value);
      setIsOpen(false);
      return;
    }

    let currentValues = Array.isArray(value) ? [...value] : [];

    if (option.exclusive) {
      onChange([option.value]);
      return;
    }

    const exclusiveValues = options.filter(o => o.exclusive).map(o => o.value);
    currentValues = currentValues.filter(v => !exclusiveValues.includes(v));

    if (currentValues.includes(option.value)) {
      onChange(currentValues.filter(v => v !== option.value));
    } else {
      onChange([...currentValues, option.value]);
    }
  };

  const displayLabel = React.useMemo(() => {
    if (!multiple) {
      const selectedOption = options.find(o => o.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }

    const values = Array.isArray(value) ? value : [];
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return options.find(o => o.value === values[0])?.label || placeholder;
    }
    return `${values.length} selected`;
  }, [value, multiple, options, placeholder]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full min-w-32 overflow-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 text-slate-700 dark:text-slate-200 shadow-md animate-in fade-in-0 zoom-in-95",
            "[&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700",
            "hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600",
            "[direction:rtl]"
          )}
        >
          {options.map((option) => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "[direction:ltr]",
                  "relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                  "focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800/50",
                  isSelected && "font-medium text-slate-900 dark:text-slate-50"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-slate-900 dark:text-slate-50 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}