"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateParticipant(
    participantId: string,
    formData: FormData
) {
    const supabase = await createClient();

    const name = formData.get("name");
    const birthYearValue = formData.get("birth_year");
    const participantType = formData.get("participant_type");
    const active = formData.get("active") === "on";

    if (
        typeof name !== "string" ||
        name.trim() === "" ||
        typeof participantType !== "string" ||
        !["athlete", "reference"].includes(participantType)
    ) {
        throw new Error("Ungültige Eingabe");
    }

    const birthYear =
        typeof birthYearValue === "string" && birthYearValue.trim() !== ""
            ? Number(birthYearValue)
            : null;

    if (birthYear !== null && !Number.isInteger(birthYear)) {
        throw new Error("Ungültiger Jahrgang");
    }

    const { error } = await supabase
        .from("participants")
        .update({
            name: name.trim(),
            birth_year: birthYear,
            participant_type: participantType,
            active,
        })
        .eq("id", participantId);

    if (error) {
        throw new Error(
            `Athlet:in konnte nicht geändert werden: ${error.message}`
        );
    }

    revalidatePath("/athletes");
    revalidatePath(`/athletes/${participantId}`);

    redirect(`/athletes/${participantId}`);
}