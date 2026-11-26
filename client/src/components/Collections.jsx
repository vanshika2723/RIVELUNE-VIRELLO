
import { ArrowUpRight } from "lucide-react";
import "../index.css";

const collections = [
  {
    title: "FOR HIM",
    subtitle: "Modern essentials. Timeless style.",
    name: "MEN'S COLLECTION",
    link: "/men",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a3f2?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "FOR HER",
    subtitle: "Effortless looks for every moment.",
    name: "WOMEN'S COLLECTION",
    link: "/women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function Collections() {
  return (
    <section className="collections-section">
      <div className="collections-heading">
        <span className="section-label">DISCOVER RIVELUNE</span>
        <h2>Made for your kind of style.</h2>
        <p>Find the pieces that feel like you.</p>
      </div>

      <div className="collections-grid">
        {collections.map((collection) => (
          <a
            href={collection.link}
            className="collection-card"
            key={collection.title}
          >
            <img src={collection.image} alt={collection.title} />

            <div className="collection-overlay"></div>

            <div className="collection-content">
              <span>{collection.title}</span>
              <h3>{collection.subtitle}</h3>

              <div className="collection-link">
                {collection.name}
                <ArrowUpRight size={17} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
