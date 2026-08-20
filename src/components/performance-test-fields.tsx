import { AgeGroupSelect } from "@/components/age-group-select";
import { NumberField } from "@/components/number-field";
import type { PerformanceTest } from "@/lib/types";

type PerformanceTestFieldsProps = {
  /** Bestehender Test bei Bearbeitung; `undefined` bei Neuanlage (leere Felder). */
  defaultValues?: Pick<
    PerformanceTest,
    | "test_date"
    | "age_group"
    | "reach_height_cm"
    | "jump_reach_cm"
    | "sprint_93639_seconds"
    | "ball_control_count"
  >;
};

/** Gemeinsame Formularfelder für Neuanlage und Bearbeitung eines Leistungstests. */
export function PerformanceTestFields({ defaultValues }: PerformanceTestFieldsProps) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="test_date" className="mb-1 block text-sm font-medium">
            Testdatum
          </label>
          <input
            id="test_date"
            name="test_date"
            type="date"
            required
            defaultValue={defaultValues?.test_date}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <AgeGroupSelect defaultValue={defaultValues?.age_group ?? ""} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <NumberField
          id="reach_height_cm"
          label="Reichhöhe"
          unit="cm"
          min="1"
          step="1"
          defaultValue={defaultValues?.reach_height_cm}
        />
        <NumberField
          id="jump_reach_cm"
          label="Sprunghöhe"
          unit="cm"
          min="1"
          step="1"
          defaultValue={defaultValues?.jump_reach_cm}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <NumberField
          id="sprint_93639_seconds"
          label="9-3-6-3-9"
          unit="s"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.sprint_93639_seconds}
        />
        <NumberField
          id="ball_control_count"
          label="Ballkontrolle"
          min="0"
          step="1"
          defaultValue={defaultValues?.ball_control_count}
        />
      </div>
    </>
  );
}
