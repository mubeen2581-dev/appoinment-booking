export const LocationSelector = ({ locations, selectedLocationId, onSelect }) => {
  return (
    <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md transition-colors dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-700 dark:text-slate-100">Choose a location</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {locations.map((location) => {
          const isSelected = selectedLocationId === location._id
          return (
            <button
              key={location._id}
              type="button"
              onClick={() => onSelect(location)}
              className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-lg dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-100'
                  : 'border-slate-200 bg-white/85 hover:border-brand-400 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/70 dark:hover:border-brand-400 dark:hover:text-brand-200'
              }`}
            >
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{location.name}</p>
              {location.address ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{location.address}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Slot interval: {location.slotIntervalMinutes} mins
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}


