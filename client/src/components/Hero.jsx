
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#e9e5df]">
      {/* Hero Background */}
      <div
        className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[780px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2000&q=90')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[600px] items-center px-6 py-20 md:min-h-[700px] md:px-16 lg:min-h-[780px] lg:px-24">
          <div className="max-w-3xl text-white">

            {/* Eyebrow */}
            <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.35em] text-white/80 md:text-xs">
              The New Season · 2026
            </p>

            {/* Heading */}
            <h1 className="mb-6 font-serif text-5xl font-light leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Style for
              <br />
              every side
              <br />
              <span className="italic font-normal">of you.</span>
            </h1>

            {/* Description */}
            <p className="mb-10 max-w-md text-sm leading-7 text-white/80 md:text-base">
              Pieces that speak softly.
              <br />
              Style that stays forever.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/women"
                className="group flex items-center gap-4 bg-white px-7 py-4 text-[11px] font-medium tracking-[0.18em] text-black transition-all duration-300 hover:bg-[#d8c8b8]"
              >
                SHOP WOMEN
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/men"
                className="group flex items-center gap-4 border border-white/70 px-7 py-4 text-[11px] font-medium tracking-[0.18em] text-white transition-all duration-300 hover:bg-white hover:text-black"
              >
                SHOP MEN
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Labels */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between text-[9px] font-medium tracking-[0.2em] text-white/70 md:bottom-10 md:left-16 md:right-16 lg:left-24 lg:right-24 md:text-[10px]">
          <span>RIVELUNE COLLECTION No. 01</span>
          <span className="hidden sm:block">TIMELESS BY DESIGN</span>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/20">
          <div className="h-full w-1/4 bg-white" />
        </div>
      </div>
    </section>
  );
}
