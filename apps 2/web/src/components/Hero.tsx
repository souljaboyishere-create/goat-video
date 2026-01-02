"use client";

export default function Hero() {
  return (
    <header className="w-full pt-32 pb-16 md:pt-40 md:pb-24 px-6 animate-fade-in">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-8 md:mb-10 leading-[1.1] tracking-tight text-cream relative">
          <span className="relative z-10">A Deterministic,</span>
          <br />
          <span className="relative z-10">Timeline-First</span>
          <br />
          <span className="text-amber relative z-10 drop-shadow-[0_0_30px_rgba(232,168,73,0.3)]">
            AI Video Editor
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-text-secondary leading-relaxed max-w-3xl mx-auto font-light mb-12">
          Build videos like a compiler, not a slot machine.
          <br className="hidden md:block" />
          Edit on a timeline. Reuse voices and characters.
          <br className="hidden md:block" />
          Re-render endlessly with reproducible results.
        </p>

        {/* Decorative underline */}
        <div className="flex justify-center mb-12">
          <div className="w-24 h-0.5 bg-amber/50 shadow-[0_0_8px_rgba(232,168,73,0.5)]" />
        </div>
      </div>
    </header>
  );
}

