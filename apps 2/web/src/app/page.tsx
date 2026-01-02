import Hero from "../components/Hero";
import CTASection from "../components/CTASection";
import FeatureGrid from "../components/FeatureGrid";

export default function HomePage() {
  return (
    <main className="min-h-screen pt-16 md:pt-20">
      <Hero />
      <CTASection />
      <FeatureGrid />
    </main>
  );
}
