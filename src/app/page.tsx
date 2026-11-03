import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/sections/hero";
import { Topics } from "@/components/sections/topics";
import { DataSection } from "@/components/sections/data-section";
import { Method } from "@/components/sections/method";
import { SiteFooter } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Topics />
        <DataSection />
        <Method />
      </main>
      <SiteFooter />
    </>
  );
}
