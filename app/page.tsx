import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Ingredients } from "@/components/landing/Ingredients";
import { Marquee } from "@/components/landing/Marquee";
import { Process } from "@/components/landing/Process";
import { Product } from "@/components/landing/Product";
import { Ritual } from "@/components/landing/Ritual";
import { Testimonials } from "@/components/landing/Testimonials";
import { ShoppableVideoCarousel } from "@/components/ShoppableVideoCarousel";
import { getHeroProduct } from "@/lib/products";

export default async function HomePage() {
  const product = await getHeroProduct();

  return (
    <main className="bg-background">
      <Header shopPrice={product.price} />
      <Hero />
      <Marquee />
      <Product product={product} />
      <BeforeAfter />
      <Process />
      <Ingredients />
      <Ritual />
      <ShoppableVideoCarousel product={product} />
      <Testimonials />
      <FinalCTA price={product.price} />
      <Footer />
    </main>
  );
}
