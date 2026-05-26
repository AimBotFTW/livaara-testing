import type { Product } from "@/lib/types/database";
import { formatInr } from "@/lib/utils";
import { LandingImage } from "./LandingImage";

const DEFAULT_BENEFITS = [
  "Reduces hair fall in 4 weeks",
  "Restores scalp microbiome",
  "Strengthens follicles at root",
  "100% natural, dosha-aligned",
];

type ProductSectionProps = {
  product: Product;
};

export function Product({ product }: ProductSectionProps) {
  const benefits = DEFAULT_BENEFITS;

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
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-primary/90">
                <span className="text-accent mt-1">✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <span className="font-serif text-4xl text-primary">{formatInr(product.price)}</span>
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
          <div className="aspect-square bg-secondary/50 rounded-sm overflow-hidden hover-scale relative">
            <LandingImage
              src="/images/lomaras-bottle.jpg"
              alt="Lomaras Ayurvedic Scalp Oil bottle"
              width={1024}
              height={1024}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover image-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
