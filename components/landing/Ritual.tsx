export function Ritual() {
  const steps = [
    {
      n: "01",
      title: "Find your dosha",
      body: "Three honest questions about your scalp — dry, oily, or reactive.",
    },
    {
      n: "02",
      title: "The marma massage",
      body: "Fingertips only, slow circular motion. Begin at the crown — minimum seven minutes.",
    },
    {
      n: "03",
      title: "Rest & repeat",
      body: "Forty-five minutes minimum. Overnight is optimal. Two to three times a week.",
    },
  ];
  return (
    <section id="ritual" className="py-20 md:py-32">
      <div className="container-px mx-auto max-w-4xl">
        <div className="text-center">
          <p className="eyebrow mb-4">— Your Practice</p>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            How to begin your <span className="italic text-accent">ritual</span>
          </h2>
        </div>
        <div className="mt-14 divide-y divide-border border-y border-border">
          {steps.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-[auto_1fr] gap-6 md:gap-12 py-7 items-baseline"
            >
              <div className="font-serif text-2xl md:text-3xl text-accent/70 w-12">{s.n}</div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl text-primary">{s.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm md:text-base leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
