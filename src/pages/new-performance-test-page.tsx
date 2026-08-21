import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PerformanceTestFields } from "@/components/performance-test-fields";
import { fetchParticipantById, queryKeys } from "@/lib/data";
import { parsePerformanceTestForm } from "@/lib/forms";
import { createPerformanceTest } from "@/lib/mutations";
import { useMutationWithError } from "@/lib/use-mutation-with-error";
import { NotFoundPage } from "@/pages/not-found-page";

export function NewPerformanceTestPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const participantQuery = useQuery({
    queryKey: queryKeys.participant(id ?? ""),
    queryFn: () => fetchParticipantById(id ?? ""),
    enabled: !!id,
  });

  const { mutation, errorMessage } = useMutationWithError({
    mutationFn: async (formData: FormData) => {
      const values = parsePerformanceTestForm(formData);

      if (!id) {
        throw new Error("Fehlende ID.");
      }

      await createPerformanceTest(id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.performanceTestsByParticipant(id ?? ""),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      await queryClient.invalidateQueries({ queryKey: queryKeys.comparison });
      if (id) {
        navigate(`/athletes/${id}`);
      }
    },
    errorFallback: "Speichern fehlgeschlagen.",
  });

  if (participantQuery.isPending) {
    return <p className="text-sm text-foreground/60">Lade Athlet:in...</p>;
  }

  if (!id) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-400">{participantQuery.error.message}</p>;
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
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          {`<- ${participant.name}`}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leistungstest hinzufügen</h1>
        <p className="mt-2 text-sm text-foreground/60">
          {participant.name}
          {participant.birth_year ? ` · Jahrgang ${participant.birth_year}` : ""}
        </p>
      </header>

      <form
        className="max-w-2xl space-y-6 rounded-xl border border-card-border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(new FormData(event.currentTarget));
        }}
      >
        <PerformanceTestFields />

        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {mutation.isPending ? "Speichert..." : "Test speichern"}
          </button>

          <Link
            to={`/athletes/${participant.id}`}
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium hover:bg-sage/20"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </>
  );
}
