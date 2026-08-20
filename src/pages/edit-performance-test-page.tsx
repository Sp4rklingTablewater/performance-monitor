import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AgeGroupSelect } from "@/components/age-group-select";
import { NumberField } from "@/components/number-field";
import { fetchParticipantById, fetchPerformanceTest, queryKeys } from "@/lib/data";
import { parseNullableNumber, parseOptionalString, requireString } from "@/lib/forms";
import { updatePerformanceTest } from "@/lib/mutations";
import { NotFoundPage } from "@/pages/not-found-page";

export function EditPerformanceTestPage() {
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
    mutationFn: async (formData: FormData) => {
      const testDate = requireString(formData.get("test_date"), "Testdatum");
      const ageGroup = parseOptionalString(formData.get("age_group"));
      const reachHeight = parseNullableNumber(formData.get("reach_height_cm"));
      const jumpReach = parseNullableNumber(formData.get("jump_reach_cm"));
      const sprint = parseNullableNumber(formData.get("sprint_93639_seconds"));
      const ballControl = parseNullableNumber(formData.get("ball_control_count"));

      if (!id || !testId) {
        throw new Error("Fehlende IDs.");
      }

      await updatePerformanceTest(id, testId, {
        testDate,
        ageGroup,
        reachHeight,
        jumpReach,
        sprint,
        ballControl,
      });
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
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Aktualisierung fehlgeschlagen.");
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
          to={`/athletes/${participant.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {`<- ${participant.name}`}
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Leistungstest bearbeiten</h1>
      </header>

      <form
        className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setErrorMessage(null);
          mutation.mutate(new FormData(event.currentTarget));
        }}
      >
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
              defaultValue={test.test_date}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>

          <AgeGroupSelect defaultValue={test.age_group ?? ""} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            id="reach_height_cm"
            label="Reichhöhe"
            defaultValue={test.reach_height_cm}
            step="1"
            min="1"
          />
          <NumberField
            id="jump_reach_cm"
            label="Sprunghöhe"
            defaultValue={test.jump_reach_cm}
            step="1"
            min="1"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <NumberField
            id="sprint_93639_seconds"
            label="9-3-6-3-9"
            defaultValue={test.sprint_93639_seconds}
            step="0.01"
            min="0"
          />
          <NumberField
            id="ball_control_count"
            label="Ballkontrolle"
            defaultValue={test.ball_control_count}
            step="1"
            min="0"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Speichert..." : "Änderungen speichern"}
          </button>

          <Link
            to={`/athletes/${participant.id}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Abbrechen
          </Link>

          <Link
            to={`/athletes/${participant.id}/tests/${test.id}/delete`}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Test löschen
          </Link>
        </div>
      </form>
    </>
  );
}
