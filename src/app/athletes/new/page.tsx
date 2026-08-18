import { createParticipant } from "./actions";

export default function NewAthletePage() {
    return (
        <>
            <header className="mb-8">
                <p className="text-sm font-medium text-zinc-500">Athlet:innen</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Athlet:in hinzufügen
                </h1>
            </header>

            <form
                action={createParticipant}
                className="max-w-xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
            >
                <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium">
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="birth_year"
                        className="mb-1 block text-sm font-medium"
                    >
                        Jahrgang
                    </label>

                    <input
                        id="birth_year"
                        name="birth_year"
                        type="number"
                        min="1900"
                        max="2100"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="participant_type"
                        className="mb-1 block text-sm font-medium"
                    >
                        Typ
                    </label>

                    <select
                        id="participant_type"
                        name="participant_type"
                        defaultValue="athlete"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    >
                        <option value="athlete">Athlet:in</option>
                        <option value="reference">Referenz</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                    Speichern
                </button>
            </form>
        </>
    );
}