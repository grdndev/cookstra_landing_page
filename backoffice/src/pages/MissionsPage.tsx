export default function MissionsPage() {
  return (
    <main>
      <div>
        <h2>Operations overview</h2>
        <p className="mt-2.5 text-(--text-secondary)">Track key metrics and keep the kitchen flow healthy.</p>
      </div>

      <section className="mt-4.5 grid grid-cols-3 gap-3 max-[900px]:grid-cols-1" aria-label="Core metrics">
        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Open orders</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">12</p>
        </article>

        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Revenue today</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">$2,840</p>
        </article>

        <article className="rounded-lg border border-(--line-soft) bg-(--bg-panel-muted) p-4 [background:linear-gradient(145deg,rgba(221,143,34,0.14),transparent_65%),var(--bg-panel-muted)]">
          <p className="font-bold text-(--text-secondary)">Avg prep time</p>
          <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-bold font-['Space_Grotesk',sans-serif]">18 min</p>
        </article>
      </section>
    </main>
  )
}
