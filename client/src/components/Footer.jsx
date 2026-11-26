
import { ArrowRight, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Newsletter */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-24">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-[#9a8170]">
          A Little Note From Us
        </p>

        <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light leading-tight text-[#25221f] sm:text-4xl md:text-5xl">
          Good style.
          <br />
          <span className="italic">Straight to your inbox.</span>
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#77716b]">
          Be the first to discover new collections, exclusive offers
          and a little inspiration for your everyday.
        </p>

        <form
          onSubmit={handleSubscribe}
          className="mx-auto mt-9 flex max-w-lg flex-col border-b border-[#25221f] sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSubscribed(false);
            }}
            placeholder="Enter your email address"
            required
            className="min-w-0 flex-1 bg-transparent px-2 py-4 text-sm text-[#25221f] outline-none placeholder:text-[#99918a]"
          />

          <button
            type="submit"
            className="group flex items-center justify-center gap-3 px-5 py-4 text-[10px] font-medium tracking-[0.2em] text-[#25221f] transition hover:text-[#9a8170]"
          >
            {subscribed ? "SUBSCRIBED" : "SUBSCRIBE"}

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </form>

        {subscribed ? (
          <p className="mt-4 text-xs text-[#76624f]">
            Thank you for joining RIVELUNE!
          </p>
        ) : (
          <p className="mt-4 text-[10px] text-[#99918a]">
            By subscribing, you agree to receive updates from RIVELUNE.
          </p>
        )}
      </section>

      {/* Main Footer */}
      <footer className="bg-[#25221f] text-white">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 px-6 py-14 sm:px-10 md:grid-cols-4 md:px-14 md:py-20 lg:px-20">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="inline-block font-serif text-3xl tracking-[0.18em] sm:text-4xl"
            >
              RIVELUNE
            </Link>

            <p className="mt-5 max-w-xs text-xs leading-7 text-white/55">
              Style for every side of you.
              Thoughtful pieces for everyday living.
            </p>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="group mt-7 inline-flex items-center gap-3 text-[10px] tracking-[0.2em] text-white/70 transition hover:text-white"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>

              FOLLOW OUR JOURNEY
            </a>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-6 text-[10px] font-medium tracking-[0.25em] text-white">
              SHOP
            </h3>

            <div className="flex flex-col gap-4 text-xs text-white/55">
              <Link to="/shop/men" className="transition hover:text-white">
                Men
              </Link>

              <Link to="/shop/women" className="transition hover:text-white">
                Women
              </Link>

              <Link
                to="/shop/new-arrivals"
                className="transition hover:text-white"
              >
                New Arrivals
              </Link>

              <Link to="/shop" className="transition hover:text-white">
                All Collections
              </Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-6 text-[10px] font-medium tracking-[0.25em] text-white">
              CUSTOMER CARE
            </h3>

            <div className="flex flex-col gap-4 text-xs text-white/55">
              <Link to="/contact" className="transition hover:text-white">
                Contact Us
              </Link>

              <Link to="/shipping" className="transition hover:text-white">
                Shipping Information
              </Link>

              <Link to="/returns" className="transition hover:text-white">
                Returns & Exchanges
              </Link>

              <Link to="/track-order" className="transition hover:text-white">
                Track Your Order
              </Link>

              <Link to="/faq" className="transition hover:text-white">
                FAQs
              </Link>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-6 text-[10px] font-medium tracking-[0.25em] text-white">
              INFORMATION
            </h3>

            <div className="flex flex-col gap-4 text-xs text-white/55">
              <Link to="/about" className="transition hover:text-white">
                Our Story
              </Link>

              <Link to="/size-guide" className="transition hover:text-white">
                Size Guide
              </Link>

              <Link to="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>

              <Link to="/terms" className="transition hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 px-6 sm:px-10 md:px-14 lg:px-20">
          <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] tracking-[0.15em] text-white/40 sm:text-[10px]">
              © 2026 RIVELUNE. ALL RIGHTS RESERVED.
            </p>

            <p className="text-[9px] tracking-[0.15em] text-white/40 sm:text-[10px]">
              PAKISTAN · PKR ₨
            </p>

            <button
              onClick={backToTop}
              className="group flex w-fit items-center gap-3 text-[10px] tracking-[0.15em] text-white/60 transition hover:text-white"
            >
              BACK TO TOP

              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition group-hover:border-white group-hover:bg-white group-hover:text-black">
                <ArrowUp size={14} />
              </span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
