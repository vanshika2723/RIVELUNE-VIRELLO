
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const collections = [
  {
    title: "FOR HIM",
    subtitle: "Modern essentials. Timeless style.",
    name: "MEN'S COLLECTION",
    link: "/shop/men",
    image:
      "https://www.apetogentleman.com/wp-content/uploads/2023/02/MensGreatestFashionStoresMain2.jpg",
  },
  {
    title: "FOR HER",
    subtitle: "Effortless looks for every moment.",
    name: "WOMEN'S COLLECTION",
    link: "/shop/women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90",
  },
];

export default function Collections() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-20">

      {/* SECTION HEADING */}
      <div className="mb-10 text-center md:mb-14">

        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-[#9a8170] md:text-xs">
          Discover Rivelune
        </p>

        <h2 className="font-serif text-3xl font-light tracking-tight text-[#25221f] sm:text-4xl md:text-5xl">
          Made for your kind of style.
        </h2>

        <p className="mt-4 text-sm text-[#77716b] md:text-base">
          Find the pieces that feel like you.
        </p>

      </div>

      {/* COLLECTION CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">

        {collections.map((collection) => (
          <Link
            to={collection.link}
            key={collection.title}
            className="group relative block h-[460px] overflow-hidden bg-[#e9e5df] sm:h-[550px] lg:h-[650px]"
          >

            {/* IMAGE */}
            <img
              src={collection.image}
              alt={collection.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* IMAGE OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-all duration-500 group-hover:from-black/80" />

            {/* TOP LABEL */}
            <div className="absolute left-6 top-6 border border-white/40 px-4 py-2 sm:left-8 sm:top-8">
              <span className="text-[9px] font-medium tracking-[0.25em] text-white sm:text-[10px]">
                RIVELUNE · 2026
              </span>
            </div>

            {/* CARD CONTENT */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9 lg:p-11">

              <span className="mb-4 block text-[10px] tracking-[0.3em] text-white/70">
                {collection.title}
              </span>

              <h3 className="mb-3 font-serif text-3xl font-light sm:text-4xl lg:text-5xl">
                {collection.subtitle}
              </h3>

              <p className="mb-7 text-xs text-white/70 sm:text-sm">
                Explore our thoughtfully curated collection.
              </p>

              {/* SHOP LINK */}
              <div className="flex items-center justify-between border-t border-white/30 pt-5">

                <span className="text-[10px] font-medium tracking-[0.2em] sm:text-xs">
                  {collection.name}
                </span>

                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 transition-all duration-300 group-hover:bg-white group-hover:text-black">

                  <ArrowUpRight
                    size={19}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />

                </span>

              </div>

            </div>

          </Link>
        ))}

      </div>

      {/* BOTTOM TEXT */}
      <div className="mt-12 text-center md:mt-16">

        <p className="font-serif text-lg italic text-[#77716b]">
          Designed to be worn. Made to be remembered.
        </p>

      </div>

    </section>
  );
}
