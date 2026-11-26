
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react";

export default function About() {
  return (
    <main className="bg-[#faf9f7] text-[#25221f]">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f3f0ec] px-5 py-20 sm:px-10 md:py-28 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170] md:text-xs">
            The Story of RIVELUNE
          </p>

          <h1 className="max-w-4xl font-serif text-4xl font-light leading-tight sm:text-5xl md:text-7xl">
            Fashion that feels
            <br />
            <span className="italic">like you.</span>
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[#77716b] md:text-base">
            A thoughtfully created wardrobe of timeless essentials,
            designed to bring simplicity, comfort and confidence
            into your everyday life.
          </p>

          <Link
            to="/shop"
            className="mt-9 inline-flex items-center gap-4 border-b border-[#25221f] pb-3 text-[10px] tracking-[0.2em] transition hover:text-[#9a8170] sm:text-xs"
          >
            DISCOVER OUR COLLECTION
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="px-5 py-20 sm:px-10 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">

          {/* Image */}
          <div className="overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
              alt="Timeless everyday fashion"
              className="h-[400px] w-full object-cover sm:h-[520px]"
            />
          </div>

          {/* Content */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Our Story
            </p>

            <h2 className="font-serif text-3xl font-light leading-tight sm:text-4xl md:text-5xl">
              Less, but
              <br />
              <span className="italic">better.</span>
            </h2>

            <div className="mt-7 space-y-5 text-sm leading-8 text-[#77716b]">
              <p>
                RIVELUNE was created around a simple idea:
                getting dressed should feel effortless.
              </p>

              <p>
                We believe clothing is more than just what you wear.
                It is a reflection of your personality, your mood
                and the little moments that make everyday life special.
              </p>

              <p>
                Our approach is rooted in thoughtful design,
                understated elegance and pieces that feel natural
                to wear — season after season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-[#25221f] px-5 py-20 text-white sm:px-10 md:py-28 lg:px-20">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#c0a895]">
              Our Philosophy
            </p>

            <h2 className="font-serif text-3xl font-light leading-tight sm:text-4xl md:text-5xl">
              A wardrobe built around
              <br />
              <span className="italic">what matters.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-white/55">
              We celebrate the beauty of simplicity.
              Every detail, every silhouette and every choice
              is guided by the idea of making everyday dressing better.
            </p>
          </div>

          {/* Philosophy Cards */}
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

            <div className="border-t border-white/15 pt-7">
              <Heart
                size={23}
                strokeWidth={1.3}
                className="mb-7 text-[#c0a895]"
              />

              <h3 className="font-serif text-2xl font-light">
                Wear Your Way
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Style should feel personal. Our essentials are
                designed to fit naturally into your own expression.
              </p>
            </div>

            <div className="border-t border-white/15 pt-7">
              <Leaf
                size={23}
                strokeWidth={1.3}
                className="mb-7 text-[#c0a895]"
              />

              <h3 className="font-serif text-2xl font-light">
                Thoughtful Choices
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                We value considered details, comfortable fabrics
                and designs that go beyond fleeting trends.
              </p>
            </div>

            <div className="border-t border-white/15 pt-7 sm:col-span-2 lg:col-span-1">
              <Sparkles
                size={23}
                strokeWidth={1.3}
                className="mb-7 text-[#c0a895]"
              />

              <h3 className="font-serif text-2xl font-light">
                Everyday Elegance
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                From relaxed mornings to special moments,
                discover pieces that make simplicity feel beautiful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="px-5 py-20 sm:px-10 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">

          <div className="order-2 md:order-1">
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Made for Everyday
            </p>

            <h2 className="font-serif text-3xl font-light leading-tight sm:text-4xl md:text-5xl">
              Comfort meets
              <br />
              <span className="italic">quiet elegance.</span>
            </h2>

            <p className="mt-7 text-sm leading-8 text-[#77716b]">
              From the feel of the fabric to the way a piece
              moves with you, we believe the little details
              make the biggest difference.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#77716b]">
              Our collection is designed to be versatile,
              easy to style and comfortable enough to become
              a natural part of your daily wardrobe.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-4 border-b border-[#25221f] pb-3 text-[10px] tracking-[0.2em] transition hover:text-[#9a8170] sm:text-xs"
            >
              EXPLORE THE COLLECTION
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="order-1 overflow-hidden md:order-2">
            <img
              src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85"
              alt="Minimal timeless clothing"
              className="h-[400px] w-full object-cover sm:h-[520px]"
            />
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="bg-[#f3f0ec] px-5 py-20 text-center sm:px-10 md:py-28">
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          The RIVELUNE Promise
        </p>

        <h2 className="mx-auto max-w-3xl font-serif text-3xl font-light leading-tight sm:text-4xl md:text-6xl">
          Simple things.
          <br />
          <span className="italic">Beautifully considered.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#77716b]">
          Thoughtful essentials. Better experiences.
          Made to feel like you.
        </p>

        <Link
          to="/shop"
          className="mt-9 inline-flex items-center gap-3 bg-[#25221f] px-8 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#76624f] sm:text-xs"
        >
          SHOP RIVELUNE
          <ArrowRight size={15} />
        </Link>
      </section>

    </main>
  );
}
