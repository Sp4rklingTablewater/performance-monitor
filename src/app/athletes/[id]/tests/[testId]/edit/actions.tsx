"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updatePerformanceTest(
    participantId: string,
    testId: string,
    formData: FormData
) {
    const supabase = await createClient();

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

    const testDate = formData.get("test_date");

    if (typeof testDate !== "string" || testDate === "") {
        throw new Error("Testdatum fehlt");
    }

    const ageGroup = formData.get("age_group");

    const { error } = await supabase
        .from("performance_tests")
        .update({
            test_date: testDate,
            age_group:
                typeof ageGroup === "string" && ageGroup.trim() !== ""
                    ? ageGroup.trim()
                    : null,
            reach_height_cm: toNullableNumber(
                formData.get("reach_height_cm")
            ),
            jump_reach_cm: toNullableNumber(
                formData.get("jump_reach_cm")
            ),
            sprint_93639_seconds: toNullableNumber(
                formData.get("sprint_93639_seconds")
            ),
            ball_control_count: toNullableNumber(
                formData.get("ball_control_count")
            ),
        })
        .eq("id", testId)
        .eq("participant_id", participantId);

    if (error) {
        throw new Error(
            `Leistungstest konnte nicht geändert werden: ${error.message}`
        );
    }

    revalidatePath(`/athletes/${participantId}`);
    redirect(`/athletes/${participantId}`);
}