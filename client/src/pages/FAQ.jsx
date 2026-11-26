
import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    title: "Orders & Payment",
    questions: [
      {
        question: "How can I place an order?",
        answer:
          "Browse our collection, select your preferred product, choose your size and quantity, and add it to your bag. Proceed to checkout, enter your shipping details and complete your order.",
      },
      {
        question: "Which payment methods do you accept?",
        answer:
          "Available payment methods are displayed during checkout. Payment options may include Cash on Delivery and other supported payment methods depending on availability.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "If you need to modify or cancel your order, please contact our customer care team as soon as possible. Changes may not be possible once your order has been processed or shipped.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    questions: [
      {
        question: "How long does delivery take?",
        answer:
          "Delivery timelines depend on your location and order processing. Estimated delivery details will be shared when available.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Enjoy complimentary shipping on orders above PKR 10,000. Shipping charges for other orders will be displayed during checkout.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order has been placed, you can visit our Track Order page and enter your order details to check its status.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    questions: [
      {
        question: "Can I return or exchange an item?",
        answer:
          "Eligible purchases may be returned or exchanged according to our return policy. Please visit our Returns & Exchanges page for further details.",
      },
      {
        question: "How do I request a return?",
        answer:
          "Contact our customer care team with your order details and reason for return. Our team will guide you through the return process.",
      },
    ],
  },
  {
    title: "Products & Sizing",
    questions: [
      {
        question: "How do I choose the right size?",
        answer:
          "Please refer to our Size Guide before placing your order. If you are between sizes or need assistance, contact our customer care team.",
      },
      {
        question: "Will the product look exactly like the pictures?",
        answer:
          "We make every effort to display our products accurately. Actual colors may vary slightly depending on lighting conditions and your screen settings.",
      },
      {
        question: "How should I care for my clothing?",
        answer:
          "Please check the care instructions provided with the product. We recommend following the garment-specific instructions to maintain its quality and appearance.",
      },
    ],
  },
];

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;

    setOpenQuestion((prev) => (prev === key ? null : key));
  };

  return (
    <main className="bg-[#faf9f7] text-[#25221f]">

      {/* Hero */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-24">
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          Customer Care
        </p>

        <h1 className="font-serif text-4xl font-light sm:text-5xl md:text-7xl">
          Frequently Asked
          <br />
          <span className="italic">Questions.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#77716b]">
          Everything you need to know about shopping with
          RIVELUNE, from placing your order to finding
          the perfect fit.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-20">
        <div className="mx-auto max-w-4xl">

          {faqCategories.map((category, categoryIndex) => (
            <div key={category.title} className="mb-14">

              {/* Category Heading */}
              <div className="mb-6 border-b border-[#d8d1c8] pb-4">
                <h2 className="font-serif text-2xl font-light sm:text-3xl">
                  {category.title}
                </h2>
              </div>

              {/* Questions */}
              <div>
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openQuestion === key;

                  return (
                    <div
                      key={item.question}
                      className="border-b border-[#e5dfd8]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleQuestion(categoryIndex, questionIndex)
                        }
                        className="flex w-full items-center justify-between gap-5 py-6 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm leading-7 sm:text-base">
                          {item.question}
                        </span>

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8d1c8] transition-colors duration-300">
                          {isOpen ? (
                            <Minus size={15} strokeWidth={1.4} />
                          ) : (
                            <Plus size={15} strokeWidth={1.4} />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pb-6 pr-10">
                          <p className="max-w-3xl text-sm leading-8 text-[#77716b]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-20">
        <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          Still Have Questions?
        </p>

        <h2 className="font-serif text-3xl font-light sm:text-4xl">
          We're always happy
          <br />
          <span className="italic">to help.</span>
        </h2>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#77716b]">
          Can't find the answer you're looking for?
          Get in touch with our customer care team.
        </p>

        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-3 bg-[#25221f] px-8 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#76624f] sm:text-xs"
        >
          CONTACT US
          <ArrowRight size={15} />
        </Link>
      </section>

    </main>
  );
}
