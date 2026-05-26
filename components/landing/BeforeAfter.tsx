import { LandingImage } from "./LandingImage";

export function BeforeAfter() {
  return (
    <section className="py-20 md:py-32 bg-secondary/40">
      <div className="container-px mx-auto max-w-6xl text-center">
        <p className="eyebrow mb-4">— The Proof</p>
        <h2 className="font-serif text-4xl md:text-5xl text-primary">
          Real scalps. <span className="italic text-accent">Real results.</span>
        </h2>
        <div className="mt-14 grid sm:grid-cols-2 gap-6 md:gap-10">
          {[
            { src: "/images/before.jpg", tag: "Before", week: "Week 0", note: "Visible thinning" },
            { src: "/images/after.jpg", tag: "After", week: "Week 4", note: "Density restored" },
          ].map((it) => (
            <div key={it.tag} className="text-left">
              <div className="relative aspect-square overflow-hidden rounded-sm">
                <LandingImage
                  src={it.src}
                  alt={it.tag}
                  width={768}
                  height={768}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-background/95 text-primary text-[0.65rem] uppercase tracking-[0.22em] px-3 py-1.5 rounded-sm">
                  {it.tag}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="eyebrow">{it.week}</span>
                <span className="font-serif italic text-primary">{it.note}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Real Customer · 4-Week Ritual · Photos shared with consent
        </p>
      </div>
    </section>
  );
}
