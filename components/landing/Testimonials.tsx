export function Testimonials() {
  const reviews = [
    {
      type: "Vata Type",
      body: "I've been using hair oils for years. Nothing has actually reached my scalp the way this does. Week 3 and my hair fall has visibly reduced.",
      name: "Priya M.",
      city: "Mumbai",
    },
    {
      type: "Pitta Type",
      body: "Every oil I've tried before made my scalp react with heat. This one understood my scalp type. Six weeks of quiet, visible results.",
      name: "Rohan K.",
      city: "Bengaluru",
    },
    {
      type: "Kapha Type",
      body: "I expected another influencer-backed gimmick. What I got was an oil that has clearly been thought about with real depth.",
      name: "Anika S.",
      city: "Pune",
    },
  ];
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4">— The Community</p>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            1,000+ rituals
            <span className="italic text-accent block">already begun</span>
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className={`bg-background p-8 rounded-sm border border-border flex flex-col reveal fade-up hover-scale ${i === 0 ? "fade-up-1" : i === 1 ? "fade-up-2" : "fade-up-3"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-accent tracking-widest">★★★★★</span>
                <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {r.type}
                </span>
              </div>
              <p className="font-serif italic text-lg text-primary/90 mt-6 leading-relaxed flex-1">
                &ldquo;{r.body}&rdquo;
              </p>
              <div className="mt-8 pt-6 border-t border-border text-xs uppercase tracking-[0.18em]">
                <span className="text-accent">{r.name}</span>
                <span className="text-muted-foreground"> · {r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
