import { ArrowRight, ArrowUp } from "lucide-react";
import "../index.css";

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    alert(`Thank you for joining RIVELUNE, ${email}!`);
    e.target.reset();
  };

  return (
    <>
      {/* Newsletter Section */}
      <section className="newsletter-section">
        <span className="section-label">A LITTLE NOTE FROM US</span>

        <h2>Good style. Straight to your inbox.</h2>

        <p>
          Be the first to discover new collections, exclusive offers
          and a little inspiration for your everyday.
        </p>

        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
          />

          <button type="submit" aria-label="Subscribe">
            <span>SUBSCRIBE</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <span className="newsletter-note">
          By subscribing, you agree to receive updates from RIVELUNE.
        </span>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">

          {/* Brand */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              RIVELUNE
            </a>

            <p>
              Style for every side of you.
              <br />
              Thoughtful pieces for everyday living.
            </p>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.8"
                  fill="currentColor"
                />
              </svg>

              <span>FOLLOW OUR JOURNEY</span>
            </a>
          </div>

          {/* Shop Links */}
          <div className="footer-column">
            <h4>SHOP</h4>
            <a href="/men">Men</a>
            <a href="/women">Women</a>
            <a href="/new-arrivals">New Arrivals</a>
            <a href="/collections">All Collections</a>
          </div>

          {/* Help Links */}
          <div className="footer-column">
            <h4>HELP</h4>
            <a href="/contact">Contact Us</a>
            <a href="/shipping">Shipping Information</a>
            <a href="/returns">Returns & Exchanges</a>
            <a href="/track-order">Track Your Order</a>
          </div>

          {/* About Links */}
          <div className="footer-column">
            <h4>ABOUT</h4>
            <a href="/about">Our Story</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms & Conditions</a>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>© 2026 RIVELUNE. ALL RIGHTS RESERVED.</span>

          <span className="footer-country">
            PAKISTAN · PKR ₨
          </span>

          <button
            className="back-to-top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            BACK TO TOP
            <ArrowUp size={14} />
          </button>
        </div>
      </footer>
    </>
  );
}