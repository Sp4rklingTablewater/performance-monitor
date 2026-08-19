import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchParticipantById, fetchPerformanceTest, queryKeys } from "@/lib/data";
import { deletePerformanceTest } from "@/lib/mutations";
import { NotFoundPage } from "@/pages/not-found-page";

export function DeletePerformanceTestPage() {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id || !testId) {
        throw new Error("Fehlende IDs.");
      }

      await deletePerformanceTest(id, testId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.performanceTestsByParticipant(id ?? ""),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.comparison });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      if (id) {
        navigate(`/athletes/${id}`);
      }
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Loeschen fehlgeschlagen.");
    },
  });

  if (participantQuery.isPending || testQuery.isPending) {
    return <p className="text-sm text-zinc-500">Lade Leistungstest...</p>;
  }

  if (!id || !testId) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-700">{participantQuery.error.message}</p>;
  }

  if (testQuery.isError) {
    return <p className="text-sm text-red-700">{testQuery.error.message}</p>;
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
          to={`/athletes/${participant.id}/tests/${test.id}/edit`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {"<- Zurueck"}
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leistungstest loeschen</h1>
      </header>

      <div className="max-w-xl rounded-xl border border-red-200 bg-white p-6">
        <p className="font-medium">Moechtest du diesen Leistungstest wirklich loeschen?</p>

        <div className="mt-4 text-sm text-zinc-600">
          <p>{participant.name}</p>
          <p>
            {test.test_date}
            {test.age_group ? ` · ${test.age_group}` : ""}
          </p>
        </div>

        <p className="mt-4 text-sm text-red-700">Der Leistungstest wird dauerhaft geloescht.</p>
        {errorMessage ? <p className="mt-3 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {mutation.isPending ? "Loescht..." : "Endgueltig loeschen"}
          </button>

          <Link
            to={`/athletes/${participant.id}/tests/${test.id}/edit`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Abbrechen
          </Link>
        </div>
      </div>
    </>
  );
}
