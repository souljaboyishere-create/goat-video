"use client";

export default function Hero() {
  return (
    <header className="w-full pt-20 pb-8 md:pt-24 md:pb-12 px-6 animate-fade-in relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber/5 via-transparent to-transparent pointer-events-none -z-0" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge/Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-medium relative z-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Everything You Need. One Platform.</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 leading-[1.1] tracking-tight text-cream relative">
          <span className="relative z-10 inline-block">The Ultimate</span>
          <br />
          <span className="relative z-10 inline-block">All-in-One</span>
          <br />
          <span className="text-amber relative z-10 inline-block drop-shadow-[0_0_30px_rgba(232,168,73,0.3)]">
            Video Platform
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed max-w-3xl mx-auto font-light mb-4">
          Professional editing power meets cutting-edge AI in one unified platform.
          <br className="hidden md:block" />
          Download from any source, edit like a pro, transform with AI, and render in stunning quality—all without switching tools.
        </p>

        {/* Decorative underline */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber/50 to-transparent shadow-[0_0_8px_rgba(232,168,73,0.5)]" />
        </div>
      </div>
    </header>
  );
}

