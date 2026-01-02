"use client";

import Card from "./Card";

const FeatureIcon = ({ type }: { type: "voice" | "face" | "render" }) => {
  const iconStyle = { width: '40px', height: '40px', color: '#E8A849' };
  
  const icons = {
    voice: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
    face: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    render: (
      <svg style={iconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };
  return icons[type];
};

export default function FeatureGrid() {
  const features: { number: string; title: string; description: string; iconType: "voice" | "face" | "render" }[] = [
    {
      number: "01",
      title: "Voice Library",
      description:
        "Clone, store, and reuse voices across projects. Voices are first-class assets — not one-off generations.",
      iconType: "voice",
    },
    {
      number: "02",
      title: "Characters & Faces",
      description:
        "Detect faces once. Bind them to characters. Transform appearances at render time without touching source footage.",
      iconType: "face",
    },
    {
      number: "03",
      title: "Deterministic Rendering",
      description:
        "Every video is a pure function of timeline + assets. Change formats, subtitles, or voices and re-render instantly.",
      iconType: "render",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Divider */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-cream/10"></div>
          <span className="text-text-muted text-sm font-medium">FEATURES</span>
          <div className="flex-1 h-px bg-cream/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`animate-fade-in ${idx === 0 ? "" : idx === 1 ? "animate-stagger-1" : "animate-stagger-2"}`}
            >
              <Card hover grain className="h-full group">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-serif text-4xl font-bold text-amber/30">
                    {feature.number}
                  </span>
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <FeatureIcon type={feature.iconType} />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-cream mb-3 tracking-tight">
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
