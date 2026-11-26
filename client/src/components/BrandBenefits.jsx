
import {
  Leaf,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const benefits = [
  {
    icon: Leaf,
    number: "01",
    title: "Thoughtful Quality",
    description:
      "Carefully selected fabrics and details designed for everyday comfort.",
  },
  {
    icon: PackageCheck,
    number: "02",
    title: "Complimentary Shipping",
    description:
      "Enjoy free shipping on orders above PKR 10,000.",
  },
  {
    icon: RefreshCcw,
    number: "03",
    title: "Easy Returns",
    description:
      "A simple return experience for eligible purchases.",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Secure Shopping",
    description:
      "A secure and reliable shopping experience from start to finish.",
  },
];

export default function BrandBenefits() {
  return (
    <section className="bg-[#f3f0ec] px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-20">

      {/* Heading */}
      <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-[#9a8170] md:text-xs">
          The Rivelune Promise
        </p>

        <h2 className="font-serif text-3xl font-light leading-tight text-[#25221f] sm:text-4xl md:text-5xl">
          More than just
          <br />
          <span className="italic">what you wear.</span>
        </h2>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#77716b] md:text-base">
          Thoughtful essentials. Better experiences.
          Made to feel like you.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 border-t border-[#d8d1c8] sm:grid-cols-2 lg:grid-cols-4">

        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className="group relative border-b border-[#d8d1c8] px-6 py-9 transition-colors duration-300 hover:bg-white/60 sm:px-8 sm:py-11 lg:border-b-0 lg:border-r lg:px-7 lg:py-12 lg:last:border-r-0"
            >
              {/* Top Row */}
              <div className="mb-9 flex items-start justify-between">
                <span className="text-[10px] tracking-[0.2em] text-[#9a8170]">
                  {benefit.number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8d1c8] text-[#25221f] transition-all duration-300 group-hover:border-[#25221f] group-hover:bg-[#25221f] group-hover:text-white">
                  <Icon size={21} strokeWidth={1.4} />
                </div>
              </div>

              {/* Text */}
              <h3 className="mb-4 font-serif text-xl font-normal text-[#25221f] sm:text-2xl">
                {benefit.title}
              </h3>

              <p className="text-xs leading-7 text-[#77716b] sm:text-sm">
                {benefit.description}
              </p>

              {/* Decorative Arrow */}
              <div className="mt-7 flex justify-end">
                <ArrowUpRight
                  size={17}
                  className="text-[#9a8170] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Statement */}
      <div className="mt-12 text-center md:mt-16">
        <p className="font-serif text-sm italic text-[#77716b] sm:text-base">
          Simple things. Beautifully considered.
        </p>
      </div>

    </section>
  );
}
