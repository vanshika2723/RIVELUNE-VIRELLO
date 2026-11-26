
import { ArrowRight } from "lucide-react";
import "../index.css";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-image">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="hero-eyebrow">THE NEW SEASON · 2026</span>

          <h1>
            Style for
            <br />
            every side of you.
          </h1>

          <p>
            Pieces that speak softly.
            <br />
            Style that stays forever.
          </p>

          <div className="hero-buttons">
            <a href="/women" className="hero-btn hero-btn-light">
              SHOP WOMEN <ArrowRight size={16} />
            </a>

            <a href="/men" className="hero-btn hero-btn-outline">
              SHOP MEN <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="hero-bottom-label">
          <span>RIVELUNE COLLECTION No. 01</span>
          <span>TIMELESS BY DESIGN</span>
        </div>
      </div>
    </section>
  );
}
