"use client";

import Card from "./Card";

const FeatureIcon = ({ type }: { type: "download" | "edit" | "ai" }) => {
  const iconStyle = { width: '40px', height: '40px', color: '#E8A849' };
  
  const icons = {
    download: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    edit: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75A2.25 2.25 0 018.25 1.5h3.478c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a2.25 2.25 0 01-2.25 2.25h-2.25C8.552 21.75 1.5 14.698 1.5 6V3.75z" />
      </svg>
    ),
    ai: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  };
  return icons[type];
};

export default function FeatureGrid() {
  const features: { number: string; title: string; description: string; iconType: "download" | "edit" | "ai" }[] = [
    {
      number: "01",
      title: "Universal Media Download",
      description:
        "Import videos and audio from YouTube, TikTok, Instagram, Rumble, Twitter, and more. Start creating immediately with content from any platform.",
      iconType: "download",
    },
    {
      number: "02",
      title: "Professional Editing Suite",
      description:
        "Timeline-based editing with precision controls. Multi-track compositing, advanced effects, color grading, and seamless transitions—all the power of professional tools in your browser.",
      iconType: "edit",
    },
    {
      number: "03",
      title: "AI-Powered Transformation",
      description:
        "Clone voices with ElevenLabs-quality technology, animate characters like Viggle AI, sync lips perfectly, replace faces, and generate realistic speech. All AI tools integrated seamlessly into your workflow.",
      iconType: "ai",
    },
  ];

  return (
    <section className="w-full py-8 md:py-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-3">
            One Platform, Infinite Possibilities
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Combine the editing power of Vegas and After Effects, the 3D capabilities of Blender, the speed of CapCut, 
            and cutting-edge AI from ElevenLabs, Viggle, and more—all in a single, revolutionary workflow.
          </p>
        </div>

        {/* Divider */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cream/10 to-cream/10"></div>
          <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Core Capabilities</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cream/10 to-cream/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`animate-fade-in ${idx === 0 ? "" : idx === 1 ? "animate-stagger-1" : "animate-stagger-2"}`}
            >
              <Card hover grain className="h-full group transition-all duration-300 hover:border-amber/20">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-serif text-4xl font-bold text-amber/20 group-hover:text-amber/30 transition-colors">
                    {feature.number}
                  </span>
                  <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <FeatureIcon type={feature.iconType} />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-cream mb-2.5 tracking-tight group-hover:text-amber transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
