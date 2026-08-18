"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type ChartPoint = {
    date: string;
    value: number;
};

type PerformanceLineChartProps = {
    title: string;
    unit: string;
    data: ChartPoint[];
    betterDirection: "higher" | "lower";
};

export function PerformanceLineChart({
                                         title,
                                         unit,
                                         data,
                                         betterDirection,
                                     }: PerformanceLineChartProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-5">
                <h3 className="font-semibold">{title}</h3>

                <p className="mt-1 text-sm text-zinc-500">
                    {betterDirection === "higher"
                        ? "Höher ist besser"
                        : "Niedriger ist besser"}
                </p>
            </div>

            {data.length < 2 ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    Mindestens zwei Messungen für eine Entwicklung erforderlich.
                </div>
            ) : (
                <LineChart
                    responsive
                    width="100%"
                    height={260}
                    data={data}
                    margin={{
                        top: 10,
                        right: 15,
                        bottom: 5,
                        left: 0,
                    }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />

                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={45}
                        unit={unit}
                    />

                    <Tooltip
                        formatter={(value) => [`${value} ${unit}`, title]}
                    />

                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="currentColor"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            )}
        </div>
    );
}