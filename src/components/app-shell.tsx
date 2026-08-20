import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { queryKeys } from "@/lib/data";

type AppShellProps = {
  children: ReactNode;
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "bg-primary text-white" : "text-sage hover:bg-white/10 hover:text-white";
}

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "bg-primary/15 text-primary font-medium"
    : "text-foreground/70 hover:bg-white/5 hover:text-foreground";
}

export function AppShell({ children }: AppShellProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.authSession });
      navigate("/login", { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-header text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-semibold">Performance Monitor</span>
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-3 md:hidden">
          <NavLink
            to="/athletes"
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-1.5 text-sm ${navLinkClass({ isActive })}`
            }
          >
            Athlet:innen
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-1.5 text-sm ${navLinkClass({ isActive })}`
            }
          >
            Vergleich
          </NavLink>
        </nav>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-sage/40 px-4 py-8 md:block">
          <nav className="space-y-1">
            <NavLink
              to="/athletes"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${sidebarLinkClass({ isActive })}`
              }
            >
              Athlet:innen
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${sidebarLinkClass({ isActive })}`
              }
            >
              Vergleich
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
