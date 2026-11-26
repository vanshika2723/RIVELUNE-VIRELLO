
import { useState } from "react";
import { ArrowRight, Mail, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      return;
    }

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="bg-[#faf9f7] text-[#25221f]">

      {/* Hero */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-24">
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          We're Here for You
        </p>

        <h1 className="font-serif text-4xl font-light sm:text-5xl md:text-7xl">
          Let's talk.
          <span className="italic"> </span>
          <br />
          <span className="italic">We're listening.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#77716b]">
          Questions about your order, our collection or anything
          else? We'd love to hear from you.
        </p>
      </section>

      {/* Contact Content */}
      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          {/* Contact Information */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Contact Information
            </p>

            <h2 className="font-serif text-3xl font-light leading-tight sm:text-4xl">
              Get in touch
              <br />
              <span className="italic">with our team.</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-[#77716b]">
              Our customer care team is here to make your
              RIVELUNE experience a little better.
              Reach out and we'll do our best to help.
            </p>

            <div className="mt-10 space-y-8">

              {/* Email */}
              <div className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d1c8]">
                  <Mail size={18} strokeWidth={1.4} />
                </div>

                <div>
                  <h3 className="text-xs font-medium tracking-wide">
                    Email Us
                  </h3>

                  <p className="mt-2 text-sm text-[#77716b]">
                    Customer support & inquiries
                  </p>

                  <a
                    href="mailto:hello@rivelune.com"
                    className="mt-2 inline-block text-sm transition hover:text-[#9a8170]"
                  >
                    hello@rivelune.com
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d1c8]">
                  <Clock size={18} strokeWidth={1.4} />
                </div>

                <div>
                  <h3 className="text-xs font-medium tracking-wide">
                    Response Time
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#77716b]">
                    We aim to respond to your inquiries
                    within 1–2 business days.
                  </p>
                </div>
              </div>

              {/* Customer Care */}
              <div className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d1c8]">
                  <MessageCircle size={18} strokeWidth={1.4} />
                </div>

                <div>
                  <h3 className="text-xs font-medium tracking-wide">
                    Customer Care
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#77716b]">
                    Need help with an order?
                    <br />
                    Visit our order tracking page.
                  </p>

                  <Link
                    to="/track-order"
                    className="mt-2 inline-flex items-center gap-2 text-xs tracking-wide transition hover:text-[#9a8170]"
                  >
                    TRACK YOUR ORDER
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="border border-[#e5dfd8] bg-white p-6 sm:p-10 md:p-12">

            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#9a8170]">
              Send Us a Message
            </p>

            <h2 className="font-serif text-3xl font-light">
              How can we help?
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs text-[#77716b]"
                >
                  Full Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full border-b border-[#d8d1c8] bg-transparent px-1 py-3 text-sm outline-none transition focus:border-[#25221f]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs text-[#77716b]"
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full border-b border-[#d8d1c8] bg-transparent px-1 py-3 text-sm outline-none transition focus:border-[#25221f]"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-xs text-[#77716b]"
                >
                  Subject *
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full border-b border-[#d8d1c8] bg-transparent px-1 py-3 text-sm outline-none transition focus:border-[#25221f]"
                >
                  <option value="">Select a subject</option>
                  <option value="Order Inquiry">Order Inquiry</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Returns & Exchanges">
                    Returns & Exchanges
                  </option>
                  <option value="Product Information">
                    Product Information
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs text-[#77716b]"
                >
                  Your Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  required
                  className="w-full resize-none border-b border-[#d8d1c8] bg-transparent px-1 py-3 text-sm outline-none transition focus:border-[#25221f]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 bg-[#25221f] px-6 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#76624f] sm:text-xs"
              >
                SEND MESSAGE
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              {/* Success */}
              {submitted && (
                <div className="border border-[#d8d1c8] bg-[#f3f0ec] p-4 text-center">
                  <p className="text-sm text-[#76624f]">
                    Thank you for contacting RIVELUNE!
                  </p>

                  <p className="mt-1 text-xs text-[#77716b]">
                    Your message has been submitted successfully.
                  </p>
                </div>
              )}

              <p className="text-center text-[10px] leading-6 text-[#99918a]">
                By submitting this form, you agree to our
                <Link to="/privacy" className="mx-1 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e5dfd8] px-5 py-14 text-center sm:px-8">
        <h2 className="font-serif text-2xl font-light sm:text-3xl">
          Looking for something special?
        </h2>

        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-3 text-[10px] tracking-[0.2em] transition hover:text-[#9a8170]"
        >
          EXPLORE OUR COLLECTION
          <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}
