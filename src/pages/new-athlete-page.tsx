import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { parseNullableNumber, parseParticipantType, requireString } from "@/lib/forms";
import { createParticipant } from "@/lib/mutations";
import { queryKeys } from "@/lib/data";

export function NewAthletePage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const name = requireString(formData.get("name"), "Name");
      const participantType = parseParticipantType(formData.get("participant_type"));
      const birthYear = parseNullableNumber(formData.get("birth_year"));
      await createParticipant({ name, participantType, birthYear });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.participants });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      navigate("/athletes");
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    },
  });

  return (
    <>
      <header className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Athlet:innen</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Athlet:in hinzufügen</h1>
      </header>

      <form
        className="max-w-xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setErrorMessage(null);
          mutation.mutate(new FormData(event.currentTarget));
        }}
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="birth_year" className="mb-1 block text-sm font-medium">
            Jahrgang
          </label>
          <input
            id="birth_year"
            name="birth_year"
            type="number"
            min="1900"
            max="2100"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="participant_type" className="mb-1 block text-sm font-medium">
            Typ
          </label>
          <select
            id="participant_type"
            name="participant_type"
            defaultValue="athlete"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="athlete">Athlet:in</option>
            <option value="reference">Referenz</option>
          </select>
        </div>

        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {mutation.isPending ? "Speichert..." : "Speichern"}
        </button>
      </form>
    </>
  );
}
