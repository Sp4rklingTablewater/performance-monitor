import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchParticipantById, queryKeys } from "@/lib/data";
import { parseNullableNumber, parseParticipantType, requireString } from "@/lib/forms";
import { updateParticipant } from "@/lib/mutations";
import { NotFoundPage } from "@/pages/not-found-page";

export function EditAthletePage() {
  const { id } = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const participantQuery = useQuery({
    queryKey: queryKeys.participant(id ?? ""),
    queryFn: () => fetchParticipantById(id ?? ""),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const name = requireString(formData.get("name"), "Name");
      const participantType = parseParticipantType(formData.get("participant_type"));
      const birthYear = parseNullableNumber(formData.get("birth_year"));
      const active = formData.get("active") === "on";

      if (!id) {
        throw new Error("Fehlende ID.");
      }

      await updateParticipant(id, {
        name,
        participantType,
        birthYear,
        active,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.participants });
      await queryClient.invalidateQueries({ queryKey: queryKeys.participant(id ?? "") });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      if (id) {
        navigate(`/athletes/${id}`);
      }
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Aktualisierung fehlgeschlagen.");
    },
  });

  if (participantQuery.isPending) {
    return <p className="text-sm text-zinc-500">Lade Athlet:in...</p>;
  }

  if (!id) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-700">{participantQuery.error.message}</p>;
  }

  const participant = participantQuery.data;

  if (!participant) {
    return <NotFoundPage />;
  }

  return (
    <>
      <header className="mb-8">
        <Link
          to={`/athletes/${participant.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {`<- ${participant.name}`}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Athlet:in bearbeiten</h1>
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
            defaultValue={participant.name}
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
            defaultValue={participant.birth_year ?? ""}
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
            defaultValue={participant.participant_type}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="athlete">Athlet:in</option>
            <option value="reference">Referenz</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input name="active" type="checkbox" defaultChecked={participant.active} />
          <span className="text-sm font-medium">Aktiv</span>
          <span className="block text-sm text-zinc-500">
            Deaktivierte Athlet:innen bleiben mit ihren Tests erhalten.
          </span>
        </label>

        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Speichert..." : "Aenderungen speichern"}
          </button>

          <Link
            to={`/athletes/${participant.id}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </>
  );
}
