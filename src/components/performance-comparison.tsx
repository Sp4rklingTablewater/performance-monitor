"use client";

import { useMemo, useState } from "react";

import {
    ComparisonChart,
    ComparisonChartItem,
    ComparisonMetric,
} from "@/components/comparison-chart";

type Participant = {
    id: string;
    name: string;
    birth_year: number | null;
    participant_type: "athlete" | "reference";
    active: boolean;
};

type PerformanceTest = {
    id: string;
    test_date: string;
    age_group: string | null;
    reach_height_cm: number | null;
    jump_reach_cm: number | null;
    sprint_93639_seconds: number | null;
    ball_control_count: number | null;
    participants: Participant | Participant[];
};

type PerformanceComparisonProps = {
    tests: PerformanceTest[];
};

type MetricFilter = "all" | ComparisonMetric;

const ageGroupOrder = [
    "U13",
    "U14",
    "U16.2",
    "U16.1",
];

function getParticipant(
    test: PerformanceTest
): Participant | null {
    if (Array.isArray(test.participants)) {
        return test.participants[0] ?? null;
    }

    return test.participants;
}

function getMetricValue(
    test: PerformanceTest,
    metric: ComparisonMetric
): number | null {
    if (metric === "jump_height") {
        if (
            test.reach_height_cm === null ||
            test.jump_reach_cm === null
        ) {
            return null;
        }

        return (
            test.jump_reach_cm -
            test.reach_height_cm
        );
    }

    if (metric === "sprint_93639") {
        return test.sprint_93639_seconds === null
            ? null
            : Number(test.sprint_93639_seconds);
    }

    return test.ball_control_count;
}

export function PerformanceComparison({
                                          tests,
                                      }: PerformanceComparisonProps) {
    const [birthYear, setBirthYear] =
        useState("all");

    const [ageGroup, setAgeGroup] =
        useState("U14");

    const [metric, setMetric] =
        useState<MetricFilter>("all");

    const [
        showReferences,
        setShowReferences,
    ] = useState(true);

    const birthYears = useMemo(() => {
        return Array.from(
            new Set(
                tests
                    .map((test) =>
                        getParticipant(test)
                    )
                    .filter(
                        (
                            participant
                        ): participant is Participant =>
                            participant !== null &&
                            participant.participant_type ===
                            "athlete" &&
                            participant.birth_year !==
                            null
                    )
                    .map(
                        (participant) =>
                            participant.birth_year as number
                    )
            )
        ).sort((a, b) => a - b);
    }, [tests]);

    const availableAgeGroups = useMemo(() => {
        const found = new Set(
            tests
                .map((test) => test.age_group)
                .filter(
                    (
                        value
                    ): value is string =>
                        value !== null &&
                        value !== ""
                )
        );

        return ageGroupOrder.filter((group) =>
            found.has(group)
        );
    }, [tests]);

    function getChartData(
        selectedMetric: ComparisonMetric
    ): ComparisonChartItem[] {
        return tests
            .filter((test) => {
                const participant =
                    getParticipant(test);

                if (!participant) {
                    return false;
                }

                if (
                    test.age_group !== ageGroup
                ) {
                    return false;
                }

                const isReference =
                    participant.participant_type ===
                    "reference";

                if (isReference) {
                    return showReferences;
                }

                if (
                    birthYear !== "all" &&
                    participant.birth_year !==
                    Number(birthYear)
                ) {
                    return false;
                }

                return true;
            })
            .map((test) => {
                const participant =
                    getParticipant(test);

                if (!participant) {
                    return null;
                }

                const value =
                    getMetricValue(
                        test,
                        selectedMetric
                    );

                if (value === null) {
                    return null;
                }

                const isReference =
                    participant.participant_type ===
                    "reference";

                const label = isReference
                    ? `${participant.name} (Ref.)`
                    : birthYear === "all"
                        ? `${participant.name} (${
                            participant.birth_year ??
                            "–"
                        })`
                        : participant.name;

                return {
                    id: test.id,
                    label,
                    name: participant.name,
                    birthYear:
                    participant.birth_year,
                    participantType:
                    participant.participant_type,
                    testDate: test.test_date,
                    value,
                };
            })
            .filter(
                (
                    item
                ): item is ComparisonChartItem =>
                    item !== null
            );
    }

    const jumpHeightData = getChartData("jump_height");
    const sprintData = getChartData("sprint_93639");
    const ballControlData = getChartData("ball_control");

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-zinc-200 bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Jahrgang
                        </label>

                        <select
                            value={birthYear}
                            onChange={(event) =>
                                setBirthYear(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        >
                            <option value="all">
                                Alle Jahrgänge
                            </option>

                            {birthYears.map(
                                (year) => (
                                    <option
                                        key={year}
                                        value={year}
                                    >
                                        {year}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Altersklasse
                        </label>

                        <select
                            value={ageGroup}
                            onChange={(event) =>
                                setAgeGroup(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        >
                            {availableAgeGroups.map(
                                (group) => (
                                    <option
                                        key={group}
                                        value={group}
                                    >
                                        {group}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Messgröße
                        </label>

                        <select
                            value={metric}
                            onChange={(event) =>
                                setMetric(
                                    event.target
                                        .value as MetricFilter
                                )
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        >
                            <option value="all">
                                Alle Messgrößen
                            </option>

                            <option value="jump_height">
                                Sprung absolut
                            </option>

                            <option value="sprint_93639">
                                9-3-6-3-9
                            </option>

                            <option value="ball_control">
                                Ballkontrolle
                            </option>
                        </select>
                    </div>

                    <label className="flex items-end gap-2 pb-2">
                        <input
                            type="checkbox"
                            checked={
                                showReferences
                            }
                            onChange={(event) =>
                                setShowReferences(
                                    event.target.checked
                                )
                            }
                        />

                        <span className="text-sm font-medium">
                            Referenzen anzeigen
                        </span>
                    </label>
                </div>
            </section>

            {metric === "all" ? (
                <div className="grid gap-4 xl:grid-cols-3">
                    <ComparisonChart
                        metric="jump_height"
                        data={jumpHeightData}
                        birthYear={birthYear}
                        ageGroup={ageGroup}
                    />

                    <ComparisonChart
                        metric="sprint_93639"
                        data={sprintData}
                        birthYear={birthYear}
                        ageGroup={ageGroup}
                    />

                    <ComparisonChart
                        metric="ball_control"
                        data={ballControlData}
                        birthYear={birthYear}
                        ageGroup={ageGroup}
                    />
                </div>
            ) : (
                <ComparisonChart
                    metric={metric}
                    data={
                        metric === "jump_height"
                            ? jumpHeightData
                            : metric ===
                            "sprint_93639"
                                ? sprintData
                                : ballControlData
                    }
                    birthYear={birthYear}
                    ageGroup={ageGroup}
                />
            )}
        </div>
    );
}