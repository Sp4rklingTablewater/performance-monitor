import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { PerformanceLineChart } from "@/components/performance-line-chart";
import { fetchParticipantById, fetchPerformanceTestsByParticipant, queryKeys } from "@/lib/data";
import { formatTestDate } from "@/lib/format";
import { computeJumpHeight, metricConfig } from "@/lib/metrics";
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

  // Einmal pro Test die abgeleitete Sprunghöhe berechnen und sowohl für die
  // Charts (aufsteigend) als auch die Tabelle (absteigend) wiederverwenden.
  const testsWithJumpHeight = useMemo(
    () => (testsQuery.data ?? []).map((test) => ({ ...test, jumpHeight: computeJumpHeight(test) })),
    [testsQuery.data],
  );

  const chronologicalTests = useMemo(
    () => [...testsWithJumpHeight].reverse(),
    [testsWithJumpHeight],
  );

  const reachHeightData = chronologicalTests
    .filter((test) => test.reach_height_cm !== null)
    .map((test) => ({ date: formatTestDate(test.test_date), value: Number(test.reach_height_cm) }));

  const jumpReachData = chronologicalTests
    .filter((test) => test.jump_reach_cm !== null)
    .map((test) => ({ date: formatTestDate(test.test_date), value: Number(test.jump_reach_cm) }));

  const jumpHeightData = chronologicalTests
    .filter((test) => test.jumpHeight !== null)
    .map((test) => ({
      date: formatTestDate(test.test_date),
      value: test.jumpHeight as number,
    }));

  const sprintData = chronologicalTests
    .filter((test) => test.sprint_93639_seconds !== null)
    .map((test) => ({
      date: formatTestDate(test.test_date),
      value: Number(test.sprint_93639_seconds),
    }));

  const ballControlData = chronologicalTests
    .filter((test) => test.ball_control_count !== null)
    .map((test) => ({
      date: formatTestDate(test.test_date),
      value: test.ball_control_count as number,
    }));

  if (participantQuery.isPending || testsQuery.isPending) {
    return <p className="text-sm text-foreground/60">Lade Athlet:in...</p>;
  }

  if (!id) {
    return <NotFoundPage />;
  }

  if (participantQuery.isError) {
    return <p className="text-sm text-red-400">{participantQuery.error.message}</p>;
  }

  if (testsQuery.isError) {
    return <p className="text-sm text-red-400">{testsQuery.error.message}</p>;
  }

  const participant = participantQuery.data;

  if (!participant) {
    return <NotFoundPage />;
  }

  const tests = testsWithJumpHeight;

  return (
    <>
      <header className="mb-8">
        <Link to="/athletes" className="text-sm text-foreground/60 hover:text-foreground">
          {"<- Athlet:innen"}
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{participant.name}</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {participant.birth_year ? `Jahrgang ${participant.birth_year}` : "Kein Jahrgang"} ·{" "}
              {participant.participant_type === "reference" ? "Referenz" : "Athlet:in"}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/athletes/${participant.id}/edit`}
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium hover:bg-sage/20"
            >
              Bearbeiten
            </Link>

            <Link
              to={`/athletes/${participant.id}/tests/new`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Test hinzufügen
            </Link>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Entwicklung</h2>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <PerformanceLineChart
            title="Reichhöhe im Stand"
            unit="cm"
            data={reachHeightData}
            betterDirection="higher"
            decimals={metricConfig.reach_height.decimals}
          />
          <PerformanceLineChart
            title="Reichhöhe im Sprung"
            unit="cm"
            data={jumpReachData}
            betterDirection="higher"
            decimals={metricConfig.jump_reach.decimals}
          />
          <PerformanceLineChart
            title="Sprung absolut"
            unit="cm"
            data={jumpHeightData}
            betterDirection="higher"
            decimals={metricConfig.jump_height.decimals}
          />
          <PerformanceLineChart
            title="9-3-6-3-9"
            unit="s"
            data={sprintData}
            betterDirection="lower"
            decimals={metricConfig.sprint_93639.decimals}
          />
          <PerformanceLineChart
            title="Ballkontrolle"
            unit=""
            data={ballControlData}
            betterDirection="higher"
            decimals={metricConfig.ball_control.decimals}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Leistungstests</h2>

        <div className="overflow-hidden rounded-xl border border-card-border bg-card">
          <div className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-card-border px-5 py-3 text-sm font-medium text-foreground/60">
            <span>Datum</span>
            <span>Altersklasse</span>
            <span>Reichhöhe im Stand</span>
            <span>Reichhöhe im Sprung</span>
            <span>Sprung absolut</span>
            <span>9-3-6-3-9</span>
            <span>Ballkontrolle</span>
            <span></span>
          </div>

          {tests.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-foreground/60">
              Noch keine Leistungstests vorhanden.
            </div>
          ) : (
            tests.map((test) => {
              return (
                <div
                  key={test.id}
                  className="grid grid-cols-[110px_100px_repeat(5,1fr)_80px] gap-4 border-b border-card-border/50 px-5 py-4 text-sm last:border-b-0"
                >
                  <span>{formatTestDate(test.test_date)}</span>
                  <span>{test.age_group ?? "-"}</span>
                  <span>{test.reach_height_cm !== null ? `${test.reach_height_cm} cm` : "-"}</span>
                  <span>{test.jump_reach_cm !== null ? `${test.jump_reach_cm} cm` : "-"}</span>
                  <span>{test.jumpHeight !== null ? `${test.jumpHeight} cm` : "-"}</span>
                  <span>
                    {test.sprint_93639_seconds !== null ? `${test.sprint_93639_seconds} s` : "-"}
                  </span>
                  <span>{test.ball_control_count ?? "-"}</span>
                  <Link
                    to={`/athletes/${participant.id}/tests/${test.id}/edit`}
                    className="text-sm font-medium text-foreground/70 hover:text-foreground"
                  >
                    Ändern
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
