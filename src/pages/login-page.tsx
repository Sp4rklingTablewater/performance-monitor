import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSession, loginWithPassword } from "@/lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: session, isPending } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getSession,
  });

  const mutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      await loginWithPassword(payload.email, payload.password);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      const nextPath = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(nextPath, { replace: true });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Login fehlgeschlagen.");
    },
  });

  if (isPending) {
    return <main className="p-6 text-sm text-zinc-500">Prüfe Anmeldung...</main>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Anmelden</h1>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setErrorMessage(null);
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "");
            mutation.mutate({ email, password });
          }}
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
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

          {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Anmeldung läuft..." : "Anmelden"}
          </button>
        </form>
      </div>
    </main>
  );
}
