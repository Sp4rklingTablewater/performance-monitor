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
            className="text-xs font-medium text-foreground/60 hover:text-foreground"
          >
            Zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="flex h-10 flex-wrap gap-1 overflow-y-auto rounded-lg border border-card-border px-2 py-1.5">
        {availableYears.length === 0 ? (
          <span className="py-0.5 text-sm text-foreground/50">Keine Jahrgänge vorhanden</span>
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
                    ? "bg-primary text-white"
                    : "bg-card-border/40 text-foreground/70 hover:bg-card-border/60"
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
