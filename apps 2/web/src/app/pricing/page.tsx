"use client";

import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function PricingPage() {
  const { isAuthenticated, userPlan } = useAuth();

  const tiers: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "1 video per month",
        "720p export",
        "Watermark on exports",
        "Basic voice cloning",
        "Community support",
      ],
      cta: "Start Free",
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "For creators and professionals",
      features: [
        "Unlimited videos",
        "4K export",
        "No watermark",
        "Advanced voice cloning",
        "Face transformation",
        "Priority rendering",
        "Email support",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Studio",
      price: "$99",
      period: "month",
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Custom branding",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-cream mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {tiers.map((tier, idx) => (
            <div
              key={tier.name}
              className={`animate-fade-in ${idx === 0 ? "" : idx === 1 ? "animate-stagger-1" : "animate-stagger-2"}`}
            >
              <Card
                hover
                grain
                className={`h-full flex flex-col relative ${tier.popular ? "border-amber/40 border-2 shadow-[0_0_30px_rgba(232,168,73,0.15)]" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-amber text-charcoal px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-bold text-cream mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-4">
                    <span className="font-serif text-4xl font-bold text-cream">
                      {tier.price}
                    </span>
                    <span className="text-text-muted text-sm ml-2">
                      /{tier.period}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-6">
                    {tier.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-amber flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-text-secondary text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={
                    tier.name === "Free"
                      ? "/projects/new"
                      : isAuthenticated
                      ? "/projects"
                      : "/login"
                  }
                  className="block"
                >
                  <Button
                    variant={tier.popular ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </Card>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-cream mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-cream mb-2">
                Can I change plans later?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-cream mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-text-secondary text-sm">
                We accept all major credit cards and PayPal. Enterprise plans can be invoiced.
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-cream mb-2">
                Is there a free trial?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes! You can create one free video without signing up. After that, sign up for a free account to continue.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

