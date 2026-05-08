export type FilterMode = 'all' | 'full' | 'partial' | 'not_started'

interface SearchAndFiltersProps {
  query: string
  onQueryChange: (q: string) => void
  filter: FilterMode
  onFilterChange: (f: FilterMode) => void
}

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'full', label: 'Полностью оплатили' },
  { key: 'partial', label: 'Частично оплатили' },
  { key: 'not_started', label: 'Не платили' },
]

export function SearchAndFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full sm:max-w-xs">
        <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-600">
          Поиск по фамилии
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Начните вводить фамилию…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-emerald-500/0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.key
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
