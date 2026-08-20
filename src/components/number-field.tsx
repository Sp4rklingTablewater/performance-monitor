type NumberFieldProps = {
  id: string;
  label: string;
  min: string;
  step: string;
  unit?: string;
  defaultValue?: number | null;
};

export function NumberField({ id, label, min, step, unit, defaultValue }: NumberFieldProps) {
  const input = (
    <input
      id={id}
      name={id}
      type="number"
      min={min}
      step={step}
      defaultValue={defaultValue ?? ""}
      className={
        unit
          ? "w-full rounded-l-lg border border-card-border px-3 py-2"
          : "w-full rounded-lg border border-card-border px-3 py-2"
      }
    />
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>

      {unit ? (
        <div className="flex">
          {input}
          <span className="flex items-center rounded-r-lg border border-l-0 border-card-border bg-card px-3 text-sm text-foreground/60">
            {unit}
          </span>
        </div>
      ) : (
        input
      )}
    </div>
  );
}
