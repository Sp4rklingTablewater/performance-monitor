import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
    children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                    <span className="font-semibold">Performance Monitor</span>
                </div>
            </header>

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
                <aside className="hidden w-56 shrink-0 border-r border-zinc-200 px-4 py-8 md:block">
                    <nav className="space-y-1">
                        <Link
                            href="/"
                            className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                        >
                            Übersicht
                        </Link>

                        <Link
                            href="/athletes"
                            className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                        >
                            Athlet:innen
                        </Link>

                        <Link
                            href="/tests"
                            className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                        >
                            Tests
                        </Link>

                        <Link
                            href="/compare"
                            className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                        >
                            Vergleich
                        </Link>
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
            </div>
        </div>
    );
}