type BirthYearMultiSelectProps = {
  label?: string;
  availableYears: number[];
  selectedYears: number[];
  onChange: (years: number[]) => void;
};

/** Mehrfachauswahl von Jahrgängen als Chip-Liste. Leere Auswahl bedeutet „alle Jahrgänge“. */
export function BirthYearMultiSelect({
  label = "Jahrgänge",
  availableYears,
  selectedYears,
  onChange,
}: BirthYearMultiSelectProps) {
  function toggleYear(year: number) {
    onChange(
      selectedYears.includes(year)
        ? selectedYears.filter((selected) => selected !== year)
        : [...selectedYears, year],
    );
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {selectedYears.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="flex h-10 flex-wrap gap-1 overflow-y-auto rounded-lg border border-zinc-300 px-2 py-1.5">
        {availableYears.length === 0 ? (
          <span className="py-0.5 text-sm text-zinc-400">Keine Jahrgänge vorhanden</span>
        ) : (
          availableYears.map((year) => {
            const isSelected = selectedYears.includes(year);

            return (
              <button
                key={year}
                type="button"
                onClick={() => toggleYear(year)}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isSelected
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {year}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

