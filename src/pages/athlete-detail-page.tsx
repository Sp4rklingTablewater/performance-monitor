import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { PerformanceLineChart } from "@/components/performance-line-chart";
import { fetchParticipantById, fetchPerformanceTestsByParticipant, queryKeys } from "@/lib/data";
import { formatTestDate } from "@/lib/format";
import { computeJumpHeight } from "@/lib/metrics";
import { NotFoundPage } from "@/pages/not-found-page";

export function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const participantQuery = useQuery({
    queryKey: queryKeys.participant(id ?? ""),
    queryFn: () => fetchParticipantById(id ?? ""),
    enabled: !!id,
  });

  const testsQuery = useQuery({
    queryKey: queryKeys.performanceTestsByParticipant(id ?? ""),
    queryFn: () => fetchPerformanceTestsByParticipant(id ?? ""),
    enabled: !!id && !!participantQuery.data,
  });

  const chronologicalTests = useMemo(
    () => [...(testsQuery.data ?? [])].reverse(),
    [testsQuery.data],
  );

  const jumpHeightData = chronologicalTests
    .filter((test) => computeJumpHeight(test) !== null)
    .map((test) => ({
      date: formatTestDate(test.test_date),
      value: computeJumpHeight(test) as number,
    }));

  const sprintData = chronologicalTests
    .filter((test) => test.sprint_93639_seconds !== null)
    .map((test) => ({
      date: formatTestDate(test.test_date),
      value: Number(test.sprint_93639_seconds),
    }));

  const ballControlData = chronologicalTests
    .filter((test) => test.ball_control_count !== null)
    .map((test) => ({ date: formatTestDate(test.test_date), value: test.ball_control_count }));

  if (participantQuery.isPending || testsQuery.isPending) {
    return <p className="text-sm text-zinc-500">Lade Athlet:in...</p>;
  }

  if (!id) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-700">{participantQuery.error.message}</p>;
  }

  if (testsQuery.isError) {
    return <p className="text-sm text-red-700">{testsQuery.error.message}</p>;
  }

  const participant = participantQuery.data;

  if (!participant) {
    return <NotFoundPage />;
  }

  const tests = testsQuery.data ?? [];

  return (
    <>
      <header className="mb-8">
        <Link to="/athletes" className="text-sm text-zinc-500 hover:text-zinc-900">
          {"<- Athlet:innen"}
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{participant.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {participant.birth_year ? `Jahrgang ${participant.birth_year}` : "Kein Jahrgang"} ·{" "}
              {participant.participant_type === "reference" ? "Referenz" : "Athlet:in"}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/athletes/${participant.id}/edit`}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Bearbeiten
            </Link>

            <Link
              to={`/athletes/${participant.id}/tests/new`}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Test hinzufuegen
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Entwicklung</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Leistungsentwicklung ueber alle erfassten Testzeitpunkte.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PerformanceLineChart
            title="Sprung absolut"
            unit="cm"
            data={jumpHeightData}
            betterDirection="higher"
          />
          <PerformanceLineChart
            title="9-3-6-3-9"
            unit="s"
            data={sprintData}
            betterDirection="lower"
          />
          <PerformanceLineChart
            title="Ballkontrolle"
            unit=""
            data={ballControlData}
            betterDirection="higher"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Leistungstests</h2>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-500">
            <span>Datum</span>
            <span>Altersklasse</span>
            <span>Reichhoehe</span>
            <span>Sprunghoehe</span>
            <span>Sprung absolut</span>
            <span>9-3-6-3-9</span>
            <span>Ballkontrolle</span>
            <span></span>
          </div>

          {tests.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-500">
              Noch keine Leistungstests vorhanden.
            </div>
          ) : (
            tests.map((test) => {
              const jumpHeight = computeJumpHeight(test);

              return (
                <div
                  key={test.id}
                  className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-zinc-100 px-5 py-4 text-sm last:border-b-0"
                >
                  <span>{formatTestDate(test.test_date)}</span>
                  <span>{test.age_group ?? "-"}</span>
                  <span>{test.reach_height_cm !== null ? `${test.reach_height_cm} cm` : "-"}</span>
                  <span>{test.jump_reach_cm !== null ? `${test.jump_reach_cm} cm` : "-"}</span>
                  <span>{jumpHeight !== null ? `${jumpHeight} cm` : "-"}</span>
                  <span>
                    {test.sprint_93639_seconds !== null ? `${test.sprint_93639_seconds} s` : "-"}
                  </span>
                  <span>{test.ball_control_count ?? "-"}</span>
                  <Link
                    to={`/athletes/${participant.id}/tests/${test.id}/edit`}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    Aendern
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
