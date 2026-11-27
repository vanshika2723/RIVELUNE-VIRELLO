
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Database,
  Cookie,
  UserCheck,
  Mail,
  ChevronDown,
} from "lucide-react";


const sections = [
  {
    title: "Information We Collect",
    icon: Database,
    content:
      "When you interact with RIVELUNE, we may collect information such as your name, email address, phone number, shipping address, order details and information you voluntarily provide through our forms.",
  },
  {
    title: "How We Use Your Information",
    icon: UserCheck,
    content:
      "Information may be used to process orders, arrange deliveries, respond to inquiries, improve our shopping experience, communicate important updates and maintain website security.",
  },
  {
    title: "Payment Information",
    icon: LockKeyhole,
    content:
      "Payment information is processed through the payment methods and service providers made available during checkout. We do not intend to store sensitive payment credentials such as complete card numbers or security codes on our website.",
  },
  {
    title: "Cookies & Website Usage",
    icon: Cookie,
    content:
      "Our website may use cookies or similar technologies to remember shopping preferences, maintain cart functionality, understand website performance and improve your browsing experience.",
  },
  {
    title: "Sharing of Information",
    icon: Database,
    content:
      "Information may be shared with trusted service providers when necessary to fulfill orders, facilitate payments, deliver packages, maintain our website or comply with applicable legal obligations.",
  },
  {
    title: "Data Security",
    icon: ShieldCheck,
    content:
      "We take reasonable steps to protect information from unauthorized access, misuse, alteration or disclosure. However, no internet transmission or electronic storage method can be guaranteed to be completely secure.",
  },
  {
    title: "Your Privacy Choices",
    icon: UserCheck,
    content:
      "You may contact us to request access to, correction of or deletion of your personal information, subject to applicable legal requirements and information necessary to complete transactions.",
  },
  {
    title: "Third-Party Websites",
    icon: LockKeyhole,
    content:
      "Our website may contain links to external websites or services. Their privacy practices are governed by their own policies, and we encourage you to review those policies before sharing information.",
  },
];

export default function Privacy() {
  const [openSection, setOpenSection] = useState(0);

  return (
    <main className="privacy-page">
      {/* HERO */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <span className="privacy-eyebrow">
            YOUR PRIVACY MATTERS
          </span>

          <h1>
            Your trust. <br />
            <span>Your privacy.</span>
          </h1>

          <p>
            Your experience with RIVELUNE is personal.
            We believe your information deserves the same
            thoughtful care as everything we create.
          </p>

          <div className="privacy-hero-meta">
            <ShieldCheck size={18} />
            <span>Privacy & Data Protection</span>
          </div>
        </div>

        <div className="privacy-hero-image">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
            alt="Minimal fashion collection"
          />
        </div>
      </section>

      {/* INTRO */}
      <section className="privacy-intro">
        <span className="privacy-eyebrow">PRIVACY POLICY</span>

        <h2>
          A little transparency <br />
          goes a <span>long way.</span>
        </h2>

        <p>
          This Privacy Policy explains how RIVELUNE may collect,
          use, store and protect information when you browse our
          website, make a purchase or contact our team.
        </p>

        <div className="privacy-updated">
          Last updated: November 2026
        </div>
      </section>

      {/* PRIVACY FEATURES */}
      <section className="privacy-features">
        <div className="privacy-feature">
          <LockKeyhole size={24} />
          <h3>Secure Information</h3>
          <p>We take reasonable steps to protect your information.</p>
        </div>

        <div className="privacy-feature">
          <UserCheck size={24} />
          <h3>Respect Your Choices</h3>
          <p>You can contact us regarding your personal information.</p>
        </div>

        <div className="privacy-feature">
          <ShieldCheck size={24} />
          <h3>Transparency</h3>
          <p>We aim to explain how your information is used.</p>
        </div>
      </section>

      {/* POLICY ACCORDION */}
      <section className="privacy-policy-section">
        <div className="privacy-policy-heading">
          <span className="privacy-eyebrow">THE DETAILS</span>
          <h2>Our Privacy Practices</h2>
          <p>
            Explore how we handle your information and
            your privacy choices.
          </p>
        </div>

        <div className="privacy-accordion">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isOpen = openSection === index;

            return (
              <div
                className={`privacy-accordion-item ${
                  isOpen ? "active" : ""
                }`}
                key={index}
              >
                <button
                  className="privacy-accordion-button"
                  onClick={() =>
                    setOpenSection(isOpen ? -1 : index)
                  }
                >
                  <div className="privacy-accordion-title">
                    <Icon size={20} strokeWidth={1.5} />
                    <span>{section.title}</span>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`privacy-chevron ${
                      isOpen ? "rotated" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="privacy-accordion-content">
                    <p>{section.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section className="privacy-contact">
        <div className="privacy-contact-icon">
          <Mail size={28} strokeWidth={1.5} />
        </div>

        <span className="privacy-eyebrow">WE'RE HERE TO HELP</span>

        <h2>Questions about your privacy?</h2>

        <p>
          If you have questions, concerns or requests relating
          to your personal information, our team is here to help.
        </p>

        <Link to="/contact" className="privacy-contact-button">
          CONTACT US
        </Link>
      </section>

      {/* FOOTER LINKS */}
      <section className="privacy-bottom-links">
        <Link to="/returns">Returns & Exchanges</Link>
        <Link to="/shipping">Shipping Information</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </section>
    </main>
  );
}