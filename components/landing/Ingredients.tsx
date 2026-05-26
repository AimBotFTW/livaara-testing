export function Ingredients() {
  const items = [
    {
      n: "01",
      name: "Bhringraj",
      latin: "Eclipta Alba",
      body: "King of hair. Wedelolactone supports follicle activation and reduces visible breakage.",
    },
    {
      n: "02",
      name: "Amla",
      latin: "Phyllanthus Emblica",
      body: "Ayurveda's most potent antioxidant. Cold-processed to preserve full Vitamin C spectrum.",
    },
    {
      n: "03",
      name: "Neem",
      latin: "Azadirachta Indica",
      body: "Clarifying and anti-inflammatory action — direct to the scalp microbiome.",
    },
  ];
  return (
    <section id="ingredients" className="py-20 md:py-32 bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow mb-4">— The Ingredients</p>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">
            Three botanicals,
            <span className="italic text-accent block">chosen with reason.</span>
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.n}
              className="bg-background p-8 rounded-sm border border-border hover:border-accent transition-colors reveal hover-scale fade-up"
            >
              <div className="font-serif text-3xl text-accent/70 fade-up-1">{it.n}</div>
              <h3 className="font-serif text-2xl text-primary mt-6 fade-up-2">{it.name}</h3>
              <p className="eyebrow mt-1 normal-case tracking-[0.18em] italic fade-up-3">
                {it.latin}
              </p>
              <p className="mt-5 text-muted-foreground text-sm leading-relaxed fade-up">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
