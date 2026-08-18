"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function deletePerformanceTest(
    participantId: string,
    testId: string
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("performance_tests")
        .delete()
        .eq("id", testId)
        .eq("participant_id", participantId);

    if (error) {
        throw new Error(
            `Leistungstest konnte nicht gelöscht werden: ${error.message}`
        );
    }

    revalidatePath(`/athletes/${participantId}`);
    redirect(`/athletes/${participantId}`);
}