import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

interface SearchDropdownProps<T> {
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  value: string; // display value
  onSearch: (q: string) => void;
  results: T[];
  isSearching: boolean;
  renderResult: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
  onSelect: (item: T) => void;
  onClear?: () => void;
  error?: string;
  selectedLabel?: string;
  disabled?: boolean;
}

export function SearchDropdown<T>({
  label,
  icon,
  placeholder = "Search...",
  required,
  value,
  onSearch,
  results,
  isSearching,
  renderResult,
  getKey,
  onSelect,
  onClear,
  error,
  selectedLabel,
  disabled = false,
}: SearchDropdownProps<T>) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep query in sync when external value changes (e.g., on edit)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    onSearch(q);
  };

  const handleSelect = (item: T) => {
    setOpen(false);
    setQuery(selectedLabel ?? value);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    onSearch("");
    onClear?.();
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Search icon */}
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query && !disabled) setOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-12 w-full rounded-xl border-2 bg-white dark:bg-gray-800 pl-10 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all ${
            disabled ? "opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-gray-300 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
          }`}
        />

        {/* Right slot: spinner or clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : query && !disabled ? (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Dropdown results */}
        {open && (results.length > 0 || isSearching) && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {isSearching && results.length === 0 && (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </li>
            )}
            {results.map((item) => (
              <li
                key={getKey(item)}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                className="cursor-pointer px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {renderResult(item)}
              </li>
            ))}
          </ul>
        )}

        {open && !isSearching && results.length === 0 && query.length >= 1 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            No results found.
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-500/30 dark:bg-red-500/10">
          <span className="text-xs text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}
    </div>
  );
}