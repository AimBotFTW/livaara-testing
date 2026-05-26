import { LandingImage } from "./LandingImage";

export function Hero() {
  return (
    <section id="top" className="relative pt-28 md:pt-32 pb-16 md:pb-24">
      <div className="container-px mx-auto max-w-7xl grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="fade-up fade-up-1 reveal">
          <p className="eyebrow mb-6 fade-up fade-up-2">— 38 Years of Ayurvedic Craft</p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-primary fade-up fade-up-3">
            Crafted Through <span className="italic text-accent">Generations</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed fade-up fade-up-1 mt-8">
            An Ayurvedic scalp ritual born not in a lab, but in 38 years of living, healing
            practice. Cold-infused. Dosha-aligned. Slow by nature.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 fade-up fade-up-2">
            <a
              href="#product"
              className="inline-flex items-center justify-center px-7 py-3.5 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-sm hover-scale"
            >
              Consult Now
            </a>
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-2 py-3.5 text-xs uppercase tracking-[0.2em] text-primary border-b border-accent hover:text-accent transition-colors hover-scale"
            >
              Learn More →
            </a>
          </div>
          <div className="mt-12 flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-muted-foreground fade-up fade-up-3">
            <div>
              <span className="text-accent">★★★★★</span> 4.9 / 5
            </div>
            <div>1,000+ Rituals Begun</div>
          </div>
        </div>
        <div className="relative fade-up fade-up-3">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted hover-scale relative">
            <LandingImage
              src="/images/hero.jpg"
              alt="Lomaras Ayurvedic scalp oil with fresh botanicals"
              width={1280}
              height={1600}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover image-float"
            />
          </div>
          <div className="hidden md:block absolute -bottom-6 -left-6 bg-background border border-border px-6 py-4 rounded-sm fade-up fade-up-2">
            <p className="eyebrow">Hand-bottled</p>
            <p className="font-serif text-lg text-primary mt-1">100ml amber glass</p>
          </div>
        </div>
      </div>
    </section>
  );
}
