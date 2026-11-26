
import { Link } from "react-router-dom";
import { ArrowRight, Ruler } from "lucide-react";
import { useState } from "react";

const menSizes = [
  { size: "XS", chest: "34–36", waist: "28–30", hip: "34–36" },
  { size: "S", chest: "36–38", waist: "30–32", hip: "36–38" },
  { size: "M", chest: "38–40", waist: "32–34", hip: "38–40" },
  { size: "L", chest: "40–42", waist: "34–36", hip: "40–42" },
  { size: "XL", chest: "42–44", waist: "36–38", hip: "42–44" },
  { size: "XXL", chest: "44–46", waist: "38–40", hip: "44–46" },
];

const womenSizes = [
  { size: "XS", chest: "32–34", waist: "24–26", hip: "34–36" },
  { size: "S", chest: "34–36", waist: "26–28", hip: "36–38" },
  { size: "M", chest: "36–38", waist: "28–30", hip: "38–40" },
  { size: "L", chest: "38–40", waist: "30–32", hip: "40–42" },
  { size: "XL", chest: "40–42", waist: "32–34", hip: "42–44" },
  { size: "XXL", chest: "42–44", waist: "34–36", hip: "44–46" },
];

function SizeTable({ sizes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#d8d1c8]">
            {["Size", "Chest (in)", "Waist (in)", "Hip (in)"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-4 py-5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#9a8170]"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {sizes.map((item) => (
            <tr
              key={item.size}
              className="border-b border-[#e5dfd8] transition hover:bg-[#f3f0ec]"
            >
              <td className="px-4 py-5 text-sm font-medium">{item.size}</td>
              <td className="px-4 py-5 text-sm text-[#77716b]">{item.chest}</td>
              <td className="px-4 py-5 text-sm text-[#77716b]">{item.waist}</td>
              <td className="px-4 py-5 text-sm text-[#77716b]">{item.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("women");

  return (
    <main className="bg-[#faf9f7] text-[#25221f]">

      {/* Hero */}
      <section className="bg-[#f3f0ec] px-5 py-16 text-center sm:px-8 md:py-24">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#d8d1c8]">
          <Ruler size={20} strokeWidth={1.4} />
        </div>

        <p className="mb-5 mt-6 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
          Find Your Perfect Fit
        </p>

        <h1 className="font-serif text-4xl font-light sm:text-5xl md:text-7xl">
          The Size
          <br />
          <span className="italic">Guide.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#77716b]">
          Finding your perfect fit should feel effortless.
          Use our measurement guide to find the size
          that feels right for you.
        </p>
      </section>

      {/* Size Charts */}
      <section className="px-5 py-16 sm:px-8 md:py-24 lg:px-20">
        <div className="mx-auto max-w-6xl">

          <div className="mb-10 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Measurements
            </p>

            <h2 className="font-serif text-3xl font-light sm:text-4xl">
              Find your size
            </h2>
          </div>

          {/* Tabs */}
          <div className="mx-auto mb-10 flex max-w-sm border-b border-[#d8d1c8]">
            <button
              onClick={() => setActiveTab("women")}
              className={`w-1/2 py-4 text-[10px] tracking-[0.2em] transition ${
                activeTab === "women"
                  ? "border-b-2 border-[#25221f] text-[#25221f]"
                  : "text-[#99918a]"
              }`}
            >
              WOMEN
            </button>

            <button
              onClick={() => setActiveTab("men")}
              className={`w-1/2 py-4 text-[10px] tracking-[0.2em] transition ${
                activeTab === "men"
                  ? "border-b-2 border-[#25221f] text-[#25221f]"
                  : "text-[#99918a]"
              }`}
            >
              MEN
            </button>
          </div>

          {/* Table */}
          <div className="border border-[#e5dfd8] bg-white p-3 sm:p-6 md:p-8">
            <SizeTable sizes={activeTab === "women" ? womenSizes : menSizes} />
          </div>

          <p className="mt-5 text-center text-xs leading-7 text-[#99918a]">
            All measurements are approximate body measurements in inches.
            These charts are illustrative and should be adjusted to match
            RIVELUNE's actual garment sizing before publishing.
          </p>
        </div>
      </section>

      {/* How to Measure */}
      <section className="bg-[#f3f0ec] px-5 py-16 sm:px-8 md:py-24 lg:px-20">
        <div className="mx-auto max-w-6xl">

          <div className="mb-12 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
              Measuring Guide
            </p>

            <h2 className="font-serif text-3xl font-light sm:text-4xl">
              How to measure
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-8 text-[#77716b]">
              Use a flexible measuring tape and keep it comfortably
              close to your body without pulling it too tight.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {/* Chest */}
            <div className="border border-[#d8d1c8] bg-white p-7">
              <span className="text-[10px] tracking-[0.2em] text-[#9a8170]">
                01
              </span>

              <h3 className="mt-4 font-serif text-2xl font-light">
                Chest
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#77716b]">
                Wrap the measuring tape around the fullest part
                of your chest, keeping the tape level under your arms.
              </p>
            </div>

            {/* Waist */}
            <div className="border border-[#d8d1c8] bg-white p-7">
              <span className="text-[10px] tracking-[0.2em] text-[#9a8170]">
                02
              </span>

              <h3 className="mt-4 font-serif text-2xl font-light">
                Waist
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#77716b]">
                Measure around your natural waistline,
                the narrowest part of your torso.
                Keep the tape relaxed.
              </p>
            </div>

            {/* Hip */}
            <div className="border border-[#d8d1c8] bg-white p-7 sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] tracking-[0.2em] text-[#9a8170]">
                03
              </span>

              <h3 className="mt-4 font-serif text-2xl font-light">
                Hip
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#77716b]">
                Measure around the fullest part of your hips
                and seat, keeping the tape horizontal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fit Tips */}
      <section className="px-5 py-16 sm:px-8 md:py-20 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#9a8170]">
            A Little Tip
          </p>

          <h2 className="font-serif text-3xl font-light sm:text-4xl">
            Between two sizes?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-[#77716b]">
            If your measurements fall between two sizes,
            consider your preferred fit. Choose the larger
            size for a more relaxed feel or the smaller size
            for a closer fit, depending on the garment style.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-3 border-b border-[#25221f] pb-3 text-[10px] tracking-[0.2em] transition hover:text-[#9a8170] sm:text-xs"
          >
            NEED HELP WITH SIZING?
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </main>
  );
}
