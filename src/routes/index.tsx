import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import bottleImg from "@/assets/lomaras-bottle.jpg";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const NAV = [
  { id: "product", label: "Product" },
  { id: "process", label: "Process" },
  { id: "ingredients", label: "Botanicals" },
  { id: "ritual", label: "Ritual" },
  { id: "testimonials", label: "Reviews" },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      let current = "";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < 120) current = n.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 md:h-20">
        <a href="#top" className="font-serif text-xl md:text-2xl tracking-[0.2em] text-primary">
          LIVAARA
        </a>
        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                active === n.id ? "text-accent" : "text-primary/70 hover:text-primary"
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#product"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-sm"
          >
            Shop Now
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-primary p-2"
            aria-label="Menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-px mx-auto py-4 flex flex-col gap-4">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.18em] text-primary/80"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#product"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.18em] bg-primary text-primary-foreground rounded-sm"
            >
              Shop Now — ₹599
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
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
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted hover-scale">
            <img
              src={heroImg}
              alt="Lomaras Ayurvedic scalp oil with fresh botanicals"
              width={1280}
              height={1600}
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

function Marquee() {
  const items = [
    "No Mineral Oils",
    "No Silicones",
    "Cold-Infused",
    "7-Day Slow Crafted",
    "Dosha-Aligned",
    "Vaidya-Led",
  ];
  return (
    <div className="border-y border-border bg-secondary/40 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content">
          {[...items, ...items].map((i, index) => (
            <span
              key={`${i}-${index}`}
              className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap px-4 py-5"
            >
              <span className="text-accent">✦</span> {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Product() {
  const benefits = [
    "Reduces hair fall in 4 weeks",
    "Restores scalp microbiome",
    "Strengthens follicles at root",
    "100% natural, dosha-aligned",
  ];
  return (
    <section id="product" className="py-20 md:py-32">
      <div className="container-px mx-auto max-w-7xl grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="order-2 md:order-1">
          <p className="eyebrow mb-4">— The Hero Product</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight text-primary">
            Lomaras<sup className="text-sm align-super">™</sup>
            <br />
            <span className="italic text-accent">Ayurvedic Scalp Oil</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Cold-infused over seven slow days. Crafted with Bhringraj, Amla, Neem, Sesame, Brahmi &
            Methi in 100ml amber glass — formulated by a Vaidya who spent four decades studying
            scalps, not market trends.
          </p>
          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-primary/90">
                <span className="text-accent mt-1">✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <span className="font-serif text-4xl text-primary">₹599</span>
            <a
              href="https://wa.me/+918511414551"
              className="inline-flex items-center justify-center px-8 py-4 text-xs uppercase tracking-[0.2em] bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-sm hover-scale"
            >
              Free Dosha Consult
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground fade-up fade-up-3">
            Free shipping across India · 30-day ritual guarantee
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-square bg-secondary/50 rounded-sm overflow-hidden hover-scale">
            <img
              src={bottleImg}
              alt="Lomaras Ayurvedic Scalp Oil bottle"
              width={1024}
              height={1024}
              loading="lazy"
              className="w-full h-full object-cover image-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="py-20 md:py-32 bg-secondary/40">
      <div className="container-px mx-auto max-w-6xl text-center">
        <p className="eyebrow mb-4">— The Proof</p>
        <h2 className="font-serif text-4xl md:text-5xl text-primary">
          Real scalps. <span className="italic text-accent">Real results.</span>
        </h2>
        <div className="mt-14 grid sm:grid-cols-2 gap-6 md:gap-10">
          {[
            { src: beforeImg, tag: "Before", week: "Week 0", note: "Visible thinning" },
            { src: afterImg, tag: "After", week: "Week 4", note: "Density restored" },
          ].map((it) => (
            <div key={it.tag} className="text-left">
              <div className="relative aspect-square overflow-hidden rounded-sm">
                <img
                  src={it.src}
                  alt={it.tag}
                  width={768}
                  height={768}
                  loading="lazy"
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

function Process() {
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

function Ingredients() {
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

function Ritual() {
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

function Testimonials() {
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
                "{r.body}"
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

function FinalCTA() {
  return (
    <section className="py-24 md:py-36 bg-accent">
      <div className="container-px mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-5 text-primary/70">— Begin Your Ritual</p>
        <h2 className="font-serif text-5xl md:text-6xl text-primary leading-[1.05]">
          Your scalp has been <span className="italic">waiting.</span>
        </h2>
        <p className="mt-6 text-primary/80 max-w-md mx-auto">
          Seven days of craft. Thirty-eight years of wisdom. One oil — formulated for you alone.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <a
            href="#"
            className="inline-flex items-center justify-center px-9 py-4 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/85 transition-colors rounded-sm hover-scale"
          >
            Shop Lomaras™ — ₹599
          </a>
          <a
            href="https://wa.me/+918511414551"
            className="inline-flex items-center px-2 py-4 text-xs uppercase tracking-[0.2em] text-primary border-b border-primary hover:opacity-70 transition-opacity hover-scale"
          >
            Free Dosha Consult
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-px mx-auto max-w-7xl py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-2xl tracking-[0.2em]">LIVAARA</div>
          <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
            Rooted in 38 years of Vaidya-led Ayurvedic tradition. Crafted for your unique scalp, one
            slow batch at a time.
          </p>
        </div>
        {[
          { title: "Explore", links: ["The Process", "Botanicals", "Products", "Your Ritual"] },
          { title: "Products", links: ["LOMARAS™ Oil", "Root Revive Shampoo", "All Products"] },
          {
            title: "Connect",
            links: [
              <a
                href="https://www.instagram.com/livaara__?igsh=MWt1YXljMTh1aDlkdg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Instagram
              </a>,
              <a
                href="https://wa.me/+918511414551"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                WhatsApp Consult
              </a>,
              "Contact",
              "Privacy Policy",
            ],
          },
        ].map((c) => (
          <div key={c.title}>
            <p className="eyebrow mb-5">{c.title}</p>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-px mx-auto max-w-7xl py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© 2025 LIVAARA. All rights reserved.</p>
          <p className="italic">Crafted with intention. Delivered with care.</p>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <Marquee />
      <Product />
      <BeforeAfter />
      <Process />
      <Ingredients />
      <Ritual />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
