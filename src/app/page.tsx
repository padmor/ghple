"use client";

import { Navbar } from "@/components/layout/navbar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutDialog } from "@/components/cart/checkout-dialog";
import { TrackOrderDialog } from "@/components/cart/track-order-dialog";
import { HeroSection } from "@/components/sections/hero";
import { ProductsSection } from "@/components/sections/products";
import { ProcessSection } from "@/components/sections/process";
import { FounderSection } from "@/components/sections/founder";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { TradeSection } from "@/components/sections/trade";
import { FaqSection } from "@/components/sections/faq";
import { SupportSection } from "@/components/sections/support";
import { LocationsSection } from "@/components/sections/locations";
import { CareersSection } from "@/components/sections/careers";
import { Reveal } from "@/components/ui/reveal";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutDialog />
      <TrackOrderDialog />

      <main id="top">
        <HeroSection />
        <Reveal>
          <ProductsSection />
        </Reveal>
        <Reveal>
          <ProcessSection />
        </Reveal>
        <Reveal>
          <FounderSection />
        </Reveal>
        <Reveal>
          <TestimonialsSection />
        </Reveal>
        <Reveal>
          <TradeSection />
        </Reveal>
        <Reveal>
          <FaqSection />
        </Reveal>
        <Reveal>
          <SupportSection />
        </Reveal>
        <Reveal>
          <LocationsSection />
        </Reveal>
        <Reveal>
          <CareersSection />
        </Reveal>
        <SiteFooter />
      </main>
    </>
  );
}
