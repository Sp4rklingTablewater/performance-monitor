import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Seite nicht gefunden</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Die angeforderte Seite existiert nicht oder ist nicht mehr verfügbar.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Zur Übersicht
      </Link>
    </main>
  );
}
