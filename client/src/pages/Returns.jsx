
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw,
  Package,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CircleHelp,
} from "lucide-react";

const returnSteps = [
  {
    number: "01",
    title: "Contact Our Team",
    description:
      "Reach out to our customer care team with your order number and reason for return or exchange.",
  },
  {
    number: "02",
    title: "Get Return Instructions",
    description:
      "Our team will review your request and guide you through the return or exchange process.",
  },
  {
    number: "03",
    title: "Prepare Your Package",
    description:
      "Pack the item securely in its original packaging, including tags and accessories.",
  },
  {
    number: "04",
    title: "Complete Your Return",
    description:
      "Once your returned item has been received and inspected, we will update you regarding the next steps.",
  },
];

const policies = [
  {
    icon: Package,
    title: "Return Eligibility",
    description:
      "Items should be unused, unworn, unwashed and returned in their original condition with tags and packaging intact.",
  },
  {
    icon: RefreshCw,
    title: "Exchanges",
    description:
      "Exchange requests may be made for a different size or eligible item, subject to availability and approval.",
  },
  {
    icon: ShieldCheck,
    title: "Damaged or Incorrect Items",
    description:
      "If you receive an incorrect, damaged or defective item, contact us with your order details and clear photographs.",
  },
  {
    icon: RotateCcw,
    title: "Refunds",
    description:
      "Refund eligibility and processing details will be confirmed by our customer care team after the returned item is reviewed.",
  },
];

const faqs = [
  {
    question: "Can I exchange an item for a different size?",
    answer:
      "Yes, size exchanges may be requested, subject to stock availability and exchange eligibility.",
  },
  {
    question: "Can I return an item that I have worn?",
    answer:
      "Items should be unworn, unwashed and in their original condition with all tags attached to be considered eligible.",
  },
  {
    question: "What should I do if I receive the wrong product?",
    answer:
      "Contact our support team as soon as possible with your order number and photographs of the product received.",
  },
  {
    question: "How can I request a return?",
    answer:
      "Contact us through our Contact page and provide your order number, product details and reason for the request.",
  },
];

export default function Returns() {
  const [openFAQ, setOpenFAQ] = useState(0);

  return (
    <main className="returns-page">
      {/* HERO */}
      <section className="returns-hero">
        <div className="returns-hero-content">
          <span className="returns-eyebrow">CUSTOMER CARE</span>

          <h1>
            Returns & <br />
            <span>Exchanges</span>
          </h1>

          <p>
            We want every RIVELUNE purchase to feel just right.
            If something isn't perfect, we're here to help.
          </p>

          <Link to="/contact" className="returns-primary-btn">
            REQUEST A RETURN
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="returns-hero-image">
          <img
            src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=85"
            alt="Fashion clothing packaging"
          />
        </div>
      </section>

      {/* INTRO */}
      <section className="returns-intro">
        <span className="returns-eyebrow">A BETTER EXPERIENCE</span>

        <h2>
          Shopping should feel <br />
          <span>effortless.</span>
        </h2>

        <p>
          Whether it's a size adjustment, a change of mind or an issue
          with your order, our team is here to make the process as
          simple and comfortable as possible.
        </p>
      </section>

      {/* POLICY CARDS */}
      <section className="returns-policy-section">
        <div className="returns-section-heading">
          <span className="returns-eyebrow">OUR GUIDELINES</span>
          <h2>Return Policy</h2>
        </div>

        <div className="returns-policy-grid">
          {policies.map((policy, index) => {
            const Icon = policy.icon;

            return (
              <div className="returns-policy-card" key={index}>
                <div className="returns-policy-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                <h3>{policy.title}</h3>

                <p>{policy.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="returns-process-section">
        <div className="returns-process-heading">
          <span className="returns-eyebrow">SIMPLE & EASY</span>
          <h2>How It Works</h2>
          <p>Four simple steps to get started.</p>
        </div>

        <div className="returns-steps">
          {returnSteps.map((step, index) => (
            <div className="returns-step" key={index}>
              <div className="returns-step-number">
                {step.number}
              </div>

              <div className="returns-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPORTANT INFORMATION */}
      <section className="returns-notice">
        <div className="returns-notice-icon">
          <CircleHelp size={25} />
        </div>

        <div>
          <h3>Before You Request a Return</h3>

          <p>
            Please keep your order number ready. Return requests,
            eligibility, shipping arrangements and refund timelines
            are subject to confirmation by our customer care team.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="returns-faq-section">
        <div className="returns-faq-heading">
          <span className="returns-eyebrow">NEED MORE INFORMATION?</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="returns-faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`returns-faq-item ${
                openFAQ === index ? "active" : ""
              }`}
              key={index}
            >
              <button
                className="returns-faq-question"
                onClick={() =>
                  setOpenFAQ(openFAQ === index ? -1 : index)
                }
              >
                <span>{faq.question}</span>

                <span className="returns-faq-toggle">
                  {openFAQ === index ? "−" : "+"}
                </span>
              </button>

              {openFAQ === index && (
                <div className="returns-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="returns-contact">
        <div className="returns-contact-content">
          <MessageCircle size={30} strokeWidth={1.5} />

          <span className="returns-eyebrow">WE'RE HERE FOR YOU</span>

          <h2>Need a little help?</h2>

          <p>
            Our customer care team is happy to assist you with
            returns, exchanges and any order-related questions.
          </p>

          <Link to="/contact" className="returns-contact-btn">
            CONTACT OUR TEAM
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
