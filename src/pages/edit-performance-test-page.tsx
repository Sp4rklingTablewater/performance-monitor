import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PerformanceTestFields } from "@/components/performance-test-fields";
import { fetchParticipantById, fetchPerformanceTest, queryKeys } from "@/lib/data";
import { parsePerformanceTestForm } from "@/lib/forms";
import { updatePerformanceTest } from "@/lib/mutations";
import { useMutationWithError } from "@/lib/use-mutation-with-error";
import { NotFoundPage } from "@/pages/not-found-page";

export function EditPerformanceTestPage() {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const participantQuery = useQuery({
    queryKey: queryKeys.participant(id ?? ""),
    queryFn: () => fetchParticipantById(id ?? ""),
    enabled: !!id,
  });

  const testQuery = useQuery({
    queryKey: queryKeys.performanceTest(id ?? "", testId ?? ""),
    queryFn: () => fetchPerformanceTest(id ?? "", testId ?? ""),
    enabled: !!id && !!testId,
  });

  const { mutation, errorMessage } = useMutationWithError({
    mutationFn: async (formData: FormData) => {
      const values = parsePerformanceTestForm(formData);

      if (!id || !testId) {
        throw new Error("Fehlende IDs.");
      }

      await updatePerformanceTest(id, testId, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.performanceTestsByParticipant(id ?? ""),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.performanceTest(id ?? "", testId ?? ""),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.comparison });
      if (id) {
        navigate(`/athletes/${id}`);
      }
    },
    errorFallback: "Aktualisierung fehlgeschlagen.",
  });

  if (participantQuery.isPending || testQuery.isPending) {
    return <p className="text-sm text-foreground/60">Lade Leistungstest...</p>;
  }

  if (!id || !testId) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-400">{participantQuery.error.message}</p>;
  }

  if (testQuery.isError) {
    return <p className="text-sm text-red-400">{testQuery.error.message}</p>;
  }

  const participant = participantQuery.data;
  const test = testQuery.data;

  if (!participant || !test) {
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

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leistungstest bearbeiten</h1>
      </header>

      <form
        className="max-w-2xl space-y-6 rounded-xl border border-card-border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(new FormData(event.currentTarget));
        }}
      >
        <PerformanceTestFields defaultValues={test} />

        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {mutation.isPending ? "Speichert..." : "Änderungen speichern"}
          </button>

          <Link
            to={`/athletes/${participant.id}`}
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium hover:bg-sage/20"
          >
            Abbrechen
          </Link>

          <Link
            to={`/athletes/${participant.id}/tests/${test.id}/delete`}
            className="ml-auto rounded-lg border border-red-800/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/40"
          >
            Test löschen
          </Link>
        </div>
      </form>
    </>
  );
}
