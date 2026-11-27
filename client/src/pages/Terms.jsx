
import { Link } from "react-router-dom";
import {
  FileText,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";


const terms = [
  {
    icon: ShoppingBag,
    title: "Orders & Acceptance",
    text: "Placing an order on our website constitutes a request to purchase the selected products. Orders are subject to availability and confirmation. We reserve the right to review or cancel orders where necessary.",
  },
  {
    icon: CreditCard,
    title: "Pricing & Payments",
    text: "Product prices and applicable charges are displayed on our website. The final payable amount will be shown during checkout. Payment must be completed using the payment methods available at checkout.",
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    text: "Delivery estimates are provided for guidance and may vary due to location, logistics, weather or other circumstances. Customers are responsible for providing accurate delivery information.",
  },
  {
    icon: RefreshCcw,
    title: "Returns & Exchanges",
    text: "Returns and exchanges are governed by our Returns & Exchanges policy. Products must meet the applicable eligibility conditions before a return or exchange can be approved.",
  },
  {
    icon: ShieldCheck,
    title: "Product Information",
    text: "We make reasonable efforts to display product descriptions, images, colors and sizing accurately. Actual product appearance may vary slightly due to lighting, screen settings or manufacturing variations.",
  },
  {
    icon: FileText,
    title: "Website Usage",
    text: "You agree to use our website lawfully and responsibly. Unauthorized access, misuse of website functionality, fraudulent activity or attempts to interfere with website security are prohibited.",
  },
  {
    icon: AlertCircle,
    title: "Limitation of Liability",
    text: "To the extent permitted by applicable law, RIVELUNE is not responsible for indirect losses arising from website use, service interruptions or circumstances beyond our reasonable control.",
  },
  {
    icon: ShieldCheck,
    title: "Changes to These Terms",
    text: "We may update these Terms & Conditions from time to time. Updated terms will be published on this page. Continued use of the website after changes are published constitutes acceptance where permitted by law.",
  },
];

export default function Terms() {
  return (
    <main className="terms-page">
      {/* HERO */}
      <section className="terms-hero">
        <div className="terms-hero-content">
          <span className="terms-eyebrow">THE FINE PRINT</span>

          <h1>
            Terms & <br />
            <span>Conditions.</span>
          </h1>

          <p>
            A clear understanding creates a better shopping
            experience. Please take a moment to review the
            terms that apply when using RIVELUNE.
          </p>

          <div className="terms-meta">
            <FileText size={17} />
            <span>Website Terms of Use</span>
          </div>
        </div>

        <div className="terms-hero-image">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
            alt="Fashion boutique"
          />
        </div>
      </section>

      {/* INTRO */}
      <section className="terms-intro">
        <span className="terms-eyebrow">WELCOME TO RIVELUNE</span>

        <h2>
          Thoughtfully made. <br />
          <span>Clearly understood.</span>
        </h2>

        <p>
          These Terms & Conditions apply to your access to and use
          of the RIVELUNE website, including browsing products,
          placing orders and interacting with our services.
          By using our website, you agree to these terms.
        </p>

        <div className="terms-updated">
          Last updated: November 2026
        </div>
      </section>

      {/* TERMS CARDS */}
      <section className="terms-content-section">
        <div className="terms-heading">
          <span className="terms-eyebrow">PLEASE READ CAREFULLY</span>
          <h2>Our Terms</h2>
        </div>

        <div className="terms-grid">
          {terms.map((term, index) => {
            const Icon = term.icon;

            return (
              <article className="terms-card" key={index}>
                <div className="terms-card-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                <span className="terms-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{term.title}</h3>

                <p>{term.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* CUSTOMER RESPONSIBILITY */}
      <section className="terms-responsibility">
        <div className="terms-responsibility-content">
          <span className="terms-eyebrow">YOUR RESPONSIBILITY</span>

          <h2>
            Shop with <br />
            <span>confidence.</span>
          </h2>

          <p>
            Please review product details, sizes, pricing,
            delivery information and our policies before
            completing your purchase.
          </p>

          <Link to="/shop" className="terms-shop-button">
            EXPLORE COLLECTION
          </Link>
        </div>

        <div className="terms-responsibility-image">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85"
            alt="Fashion shopping collection"
          />
        </div>
      </section>

      {/* POLICY LINKS */}
      <section className="terms-policy-links">
        <span className="terms-eyebrow">MORE INFORMATION</span>

        <h2>Related Policies</h2>

        <div className="terms-links-grid">
          <Link to="/shipping" className="terms-policy-link">
            <span>Shipping Information</span>
            <span>↗</span>
          </Link>

          <Link to="/returns" className="terms-policy-link">
            <span>Returns & Exchanges</span>
            <span>↗</span>
          </Link>

          <Link to="/privacy" className="terms-policy-link">
            <span>Privacy Policy</span>
            <span>↗</span>
          </Link>

          <Link to="/contact" className="terms-policy-link">
            <span>Contact Us</span>
            <span>↗</span>
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="terms-contact">
        <h2>Need clarification?</h2>

        <p>
          If you have questions regarding these terms,
          please contact our team before placing an order.
        </p>

        <Link to="/contact" className="terms-contact-button">
          GET IN TOUCH
        </Link>
      </section>
    </main>
  );
}
