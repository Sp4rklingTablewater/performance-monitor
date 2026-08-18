"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createParticipant(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name");
    const birthYearValue = formData.get("birth_year");
    const participantType = formData.get("participant_type");

    if (
        typeof name !== "string" ||
        typeof participantType !== "string" ||
        !["athlete", "reference"].includes(participantType)
    ) {
        throw new Error("Ungültige Eingabe");
    }

    const birthYear =
        typeof birthYearValue === "string" && birthYearValue !== ""
            ? Number(birthYearValue)
            : null;

    const { error } = await supabase.from("participants").insert({
        name: name.trim(),
        birth_year: birthYear,
        participant_type: participantType,
    });

    if (error) {
        throw new Error(`Athlet:in konnte nicht gespeichert werden: ${error.message}`);
    }

    revalidatePath("/athletes");
    redirect("/athletes");
}