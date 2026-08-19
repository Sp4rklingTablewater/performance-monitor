import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      navigate("/login", { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="font-semibold">Performance Monitor</span>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-zinc-200 px-4 py-8 md:block">
          <nav className="space-y-1">
            <Link to="/" className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              Uebersicht
            </Link>
            <Link to="/athletes" className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              Athlet:innen
            </Link>
            <Link to="/compare" className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">
              Vergleich
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
