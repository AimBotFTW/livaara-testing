export function Process() {
  const steps = [
    {
      n: "I",
      eyebrow: "The Beginning",
      title: "Sourcing & Selection",
      body: "Every botanical is hand-assessed before a single drop of oil is prepared. Origin, freshness, dosha compatibility — verified.",
      note: "Bhringraj from the Western Ghats. Nothing else qualifies.",
    },
    {
      n: "II",
      eyebrow: "The Middle",
      title: "Cold Infusion",
      body: "Cold-pressed sesame, gently warmed to 48°C, receives each herb in precise dosha-specific ratios over five quiet days.",
      note: "Wedelolactone preserved. Heat-sensitive actives intact.",
    },
    {
      n: "III",
      eyebrow: "The End",
      title: "Filtration & Bottling",
      body: "Cold-filtered through natural muslin. Hand-poured into amber glass. Sealed, batch-coded, ready for your scalp.",
      note: "Amber glass blocks 99% of UV — full potency preserved.",
    },
  ];
  return (
    <section id="process" className="py-20 md:py-32">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4">— The Making</p>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            Seven days.{" "}
            <span className="italic text-accent block md:inline">Three quiet chapters.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            At low temperature. In small batches. Never rushed, never mass-produced.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-10 md:gap-12">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-border pt-8">
              <div className="font-serif text-5xl text-accent/80">{s.n}</div>
              <p className="eyebrow mt-6">— {s.eyebrow}</p>
              <h3 className="font-serif text-2xl text-primary mt-2">{s.title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">{s.body}</p>
              <p className="mt-5 pl-4 border-l-2 border-accent italic text-sm text-primary/80">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
