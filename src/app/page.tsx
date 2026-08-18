export default function Home() {
  return (
      <>
        <header className="mb-10">
          <p className="text-sm font-medium text-zinc-500">Übersicht</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Leistungsübersicht
          </h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Athlet:innen</p>
            <p className="mt-2 text-3xl font-semibold">-</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Leistungstests</p>
            <p className="mt-2 text-3xl font-semibold">-</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Jahrgänge</p>
            <p className="mt-2 text-3xl font-semibold">-</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Referenzen</p>
            <p className="mt-2 text-3xl font-semibold">-</p>
          </div>
        </section>
      </>
  );
}