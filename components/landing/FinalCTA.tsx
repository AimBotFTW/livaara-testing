import { formatInr } from "@/lib/utils";

type FinalCTAProps = {
  price: number;
};

export function FinalCTA({ price }: FinalCTAProps) {
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
            Shop Lomaras™ — {formatInr(price)}
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
