export default function Home() {
  return (
      <main className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-10">
            <p className="text-sm font-medium text-zinc-500">
              Performance Monitor
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Leistungsübersicht
            </h1>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Athlet:innen</p>
              <p className="mt-2 text-3xl font-semibold">–</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Leistungstests</p>
              <p className="mt-2 text-3xl font-semibold">–</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Jahrgänge</p>
              <p className="mt-2 text-3xl font-semibold">–</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Referenzen</p>
              <p className="mt-2 text-3xl font-semibold">-</p>
            </div>
          </section>
        </div>
      </main>
  );
}