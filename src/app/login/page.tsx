import { login } from "./actions";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
            <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6">
                <h1 className="text-2xl font-semibold">Anmelden</h1>

                <form className="mt-6 space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-medium"
                        >
                            E-Mail
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-medium"
                        >
                            Passwort
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <button
                        formAction={login}
                        className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white"
                    >
                        Anmelden
                    </button>
                </form>
            </div>
        </main>
    );
}