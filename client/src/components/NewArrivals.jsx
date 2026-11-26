
import { ArrowRight, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import "../index.css";

const formatPrice = (price) => `PKR ${price.toLocaleString("en-PK")}`;

export default function NewArrivals() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  const handleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-header">
        <div>
          <span className="section-label">FRESHLY RELEASED</span>
          <h2>New arrivals.</h2>
          <p>The latest additions to your everyday wardrobe.</p>
        </div>

        <Link to="/new-arrivals" className="view-all-link">
          VIEW ALL <ArrowRight size={16} />
        </Link>
      </div>

      <div className="products-grid">
        {products.map((product, index) => (
          <article className="product-card" key={product.id}>
            <div className="product-image-wrap">
              <Link to={`/product/${product.id}`} className="product-image-link">
                <img src={product.images[0]} alt={product.name} />

                {index < 2 && (
                  <span className="product-badge">NEW</span>
                )}
              </Link>

              <button
                className={`product-wishlist ${
                  wishlist.includes(product.id) ? "wishlist-active" : ""
                }`}
                onClick={() => handleWishlist(product.id)}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                />
              </button>

              <button
                className="quick-add-btn"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                QUICK VIEW
              </button>
            </div>

            <Link
              to={`/product/${product.id}`}
              className="product-info product-info-link"
            >
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <p className="product-color">{product.color}</p>

              <div className="product-prices">
                {product.oldPrice ? (
                  <>
                    <span className="sale-price">
                      {formatPrice(product.price)}
                    </span>
                    <span className="original-price">
                      {formatPrice(product.oldPrice)}
                    </span>
                  </>
                ) : (
                  <span className="regular-price">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
