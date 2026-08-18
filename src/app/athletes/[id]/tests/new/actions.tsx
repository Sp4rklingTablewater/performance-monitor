"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPerformanceTest(
    participantId: string,
    formData: FormData
) {
    const supabase = await createClient();

    const testDate = formData.get("test_date");
    const ageGroup = formData.get("age_group");

    const reachHeightValue = formData.get("reach_height_cm");
    const jumpReachValue = formData.get("jump_reach_cm");
    const sprintValue = formData.get("sprint_93639_seconds");
    const ballControlValue = formData.get("ball_control_count");

    if (typeof testDate !== "string" || testDate === "") {
        throw new Error("Testdatum fehlt");
    }

    const toNullableNumber = (value: FormDataEntryValue | null) => {
        if (typeof value !== "string" || value.trim() === "") {
            return null;
        }

        const parsed = Number(value);

        if (!Number.isFinite(parsed)) {
            throw new Error("Ungültiger Zahlenwert");
        }

        return parsed;
    };

    const reachHeight = toNullableNumber(reachHeightValue);
    const jumpReach = toNullableNumber(jumpReachValue);
    const sprint = toNullableNumber(sprintValue);
    const ballControl = toNullableNumber(ballControlValue);

    const { error } = await supabase.from("performance_tests").insert({
        participant_id: participantId,
        test_date: testDate,
        age_group:
            typeof ageGroup === "string" && ageGroup.trim() !== ""
                ? ageGroup.trim()
                : null,
        reach_height_cm: reachHeight,
        jump_reach_cm: jumpReach,
        sprint_93639_seconds: sprint,
        ball_control_count: ballControl,
    });

    if (error) {
        throw new Error(
            `Leistungstest konnte nicht gespeichert werden: ${error.message}`
        );
    }

    revalidatePath(`/athletes/${participantId}`);
    redirect(`/athletes/${participantId}`);
}