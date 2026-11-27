
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Package,
  Truck,
  MapPin,
  Clock,
} from "lucide-react";

const shippingSections = [
  {
    icon: Clock,
    number: "01",
    title: "Order Processing",
    description:
      "Orders are processed after confirmation. Processing times may vary depending on order volume, product availability and holidays.",
  },
  {
    icon: Truck,
    number: "02",
    title: "Delivery Time",
    description:
      "Delivery timelines depend on your destination and courier availability. Estimated delivery details will be provided whenever available.",
  },
  {
    icon: Package,
    number: "03",
    title: "Shipping Charges",
    description:
      "Enjoy complimentary shipping on orders above PKR 10,000. Applicable shipping charges for other orders will be shown at checkout.",
  },
  {
    icon: MapPin,
    number: "04",
    title: "Order Tracking",
    description:
      "Once your order is dispatched, you can use your order information to track its progress through our Track Order page.",
  },
];

export default function Shipping() {
  return (
    <main className="bg-[#faf9f7] text-[#25221f]">

      {/* Hero */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-24">
        <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          Delivery & Shipping
        </p>

        <h1 className="font-serif text-4xl font-light sm:text-5xl md:text-7xl">
          Getting your
          <br />
          <span className="italic">RIVELUNE to you.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#77716b]">
          Every order deserves a smooth journey.
          Here's everything you need to know about
          getting your favourite pieces delivered.
        </p>
      </section>

      {/* Shipping Overview */}
      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-20">
        <div className="mx-auto max-w-6xl">

          <div className="mb-12 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Shipping Information
            </p>

            <h2 className="font-serif text-3xl font-light sm:text-4xl">
              What you need to know
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {shippingSections.map((section) => {
              const Icon = section.icon;

              return (
                <div
                  key={section.number}
                  className="border border-[#e5dfd8] bg-white p-7 transition hover:bg-[#f3f0ec] sm:p-9"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.2em] text-[#9a8170]">
                      {section.number}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8d1c8]">
                      <Icon size={20} strokeWidth={1.4} />
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-light">
                    {section.title}
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-[#77716b]">
                    {section.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Notes */}
      <section className="bg-[#f3f0ec] px-5 py-16 sm:px-8 md:py-20 lg:px-20">
        <div className="mx-auto max-w-4xl">

          <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
            Please Note
          </p>

          <h2 className="font-serif text-3xl font-light sm:text-4xl">
            A few helpful details.
          </h2>

          <div className="mt-8 space-y-6 text-sm leading-8 text-[#77716b]">

            <div>
              <h3 className="mb-2 font-medium text-[#25221f]">
                Accurate shipping details
              </h3>

              <p>
                Please ensure your shipping address, contact number
                and other order details are accurate when placing
                your order. Incorrect information may result in
                delivery delays.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-[#25221f]">
                Unexpected delays
              </h3>

              <p>
                Deliveries may occasionally be affected by weather,
                public holidays, courier operations or other
                unforeseen circumstances.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-[#25221f]">
                Delivery assistance
              </h3>

              <p>
                If your order appears delayed or you need help
                with your delivery, please contact our customer
                care team with your order details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking CTA */}
      <section className="px-5 py-16 text-center sm:px-8 md:py-24">
        <div className="mx-auto max-w-2xl">
          <Package
            size={30}
            strokeWidth={1.3}
            className="mx-auto mb-6 text-[#9a8170]"
          />

          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
            Your Order Journey
          </p>

          <h2 className="font-serif text-3xl font-light sm:text-4xl">
            Wondering where
            <br />
            <span className="italic">your order is?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-8 text-[#77716b]">
            Follow your order journey with our order tracking page.
          </p>

          <Link
            to="/track-order"
            className="mt-8 inline-flex items-center gap-3 bg-[#25221f] px-8 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#76624f] sm:text-xs"
          >
            TRACK YOUR ORDER
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-[#e5dfd8] px-5 py-14 text-center sm:px-8">
        <h2 className="font-serif text-2xl font-light sm:text-3xl">
          Need a little assistance?
        </h2>

        <p className="mt-4 text-sm leading-7 text-[#77716b]">
          Our customer care team is happy to help.
        </p>

        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-3 text-[10px] tracking-[0.2em] transition hover:text-[#9a8170]"
        >
          CONTACT US
          <ArrowRight size={15} />
        </Link>
      </section>

    </main>
  );
}