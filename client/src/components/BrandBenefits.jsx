
import {
  Leaf,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import "../index.css";

const benefits = [
  {
    icon: Leaf,
    title: "Thoughtful Quality",
    description:
      "Carefully selected fabrics and details designed for everyday comfort.",
  },
  {
    icon: PackageCheck,
    title: "Complimentary Shipping",
    description:
      "Enjoy free shipping on orders above PKR 10,000.",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description:
      "A simple return experience for eligible purchases.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "A secure and reliable shopping experience from start to finish.",
  },
];

export default function BrandBenefits() {
  return (
    <section className="benefits-section">
      <div className="benefits-heading">
        <span className="section-label">THE RIVELUNE PROMISE</span>
        <h2>More than just what you wear.</h2>
        <p>
          Thoughtful essentials. Better experiences.
          Made to feel like you.
        </p>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div className="benefit-card" key={benefit.title}>
              <div className="benefit-icon">
                <Icon size={23} strokeWidth={1.4} />
              </div>

              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
