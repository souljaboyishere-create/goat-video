"use client";

import Hero from "../components/Hero";
import CTASection from "../components/CTASection";
import FeatureGrid from "../components/FeatureGrid";
import Link from "next/link";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen">
      <Hero />
      <CTASection />
      <FeatureGrid />
      
      {/* Footer CTA */}
      <section className="w-full py-12 md:py-16 px-6 border-t border-cream/5 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-cream mb-3">
            Stop Switching Between Tools
          </h2>
          <p className="text-text-secondary mb-6">
            Experience the power of multiple professional platforms unified into one seamless workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
            <Link href={isAuthenticated ? "/projects/new" : "/login"}>
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
