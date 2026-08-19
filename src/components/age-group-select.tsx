import { ageGroupOrder } from "@/lib/constants";

type AgeGroupSelectProps = {
  defaultValue?: string;
};

export function AgeGroupSelect({ defaultValue }: AgeGroupSelectProps) {
  return (
    <div>
      <label htmlFor="age_group" className="mb-1 block text-sm font-medium">
        Altersklasse
      </label>
      <select
        id="age_group"
        name="age_group"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
      >
        <option value="">Keine Angabe</option>
        {ageGroupOrder.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </div>
  );
}
