import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { queryKeys } from "@/lib/data";
import { compareModes } from "@/lib/compare-modes";

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

          {/* Auf Mobile gibt es keine Sidebar – hier deshalb alle drei
              Vergleichs-Unteransichten als gleichberechtigte Tabs neben
              "Athlet:innen", statt eines einzelnen "Vergleich"-Eintrags ohne
              weiteren Zugriff auf Ranking/Entwicklung. */}
          {compareModes.map((item) => (
            <NavLink
              key={item.mode}
              to={item.path}
              end
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-sm ${navLinkClass({ isActive })}`
              }
            >
              {item.label}
            </NavLink>
          ))}
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

            {/* Die drei Vergleichs-Unteransichten sind eigene Sidebar-Einträge
                statt eines Segmented Controls im Content-Bereich – die
                Sidebar ist bereits die zentrale Navigation der App, ein
                zweiter Umschalter an anderer Stelle wäre redundant. */}
            {compareModes.map((item) => (
              <NavLink
                key={item.mode}
                to={item.path}
                end
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${sidebarLinkClass({ isActive })}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
