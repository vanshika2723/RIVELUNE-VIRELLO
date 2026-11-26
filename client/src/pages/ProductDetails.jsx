import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import products from "../data/products";
import "../index.css";

export default function ProductDetails() {
  const { id } = useParams();
const { addToCart } = useCart();
  const product = products.find((item) => item.id === Number(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [message, setMessage] = useState("");

  const formatPrice = (price) =>
    `PKR ${price.toLocaleString("en-PK")}`;

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>This product may no longer be available.</p>
        <Link to="/">Return to homepage</Link>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(
        ((product.oldPrice - product.price) / product.oldPrice) * 100
      )
    : null;

const handleAddToBag = () => {
  if (!selectedSize) {
    setMessage("Please select your size first.");
    return;
  }

  addToCart(product, selectedSize, quantity);

  setMessage(`${product.name} added to your shopping bag!`);
};

  return (
    <main className="product-detail-page">
      <div className="product-breadcrumb">
        <Link to="/">HOME</Link> / {product.category} /{" "}
        {product.name.toUpperCase()}
      </div>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-image">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
            />

            <span className="detail-product-badge">NEW SEASON</span>
          </div>

          <div className="product-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={`product-thumbnail ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-info">
          <span className="detail-category">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="detail-price-row">
            <span className="detail-sale-price">
              {formatPrice(product.price)}
            </span>

            {product.oldPrice && (
              <>
                <span className="detail-old-price">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="detail-discount">-{discount}%</span>
              </>
            )}
          </div>

          <p className="detail-tax-note">
            Inclusive of all applicable taxes.
          </p>

          <div className="detail-divider" />

          <div className="detail-color-row">
            <span>
              Color: <strong>{product.color}</strong>
            </span>
            <div
              className="color-swatch selected-swatch"
              style={{ backgroundColor: product.colorCode }}
              title={product.color}
            />
          </div>

          <p className="detail-size-heading">SELECT SIZE</p>

          <div className="detail-size-options">
            {product.sizes.map((size) => (
              <button
                key={size}
                className={`detail-size-btn ${
                  selectedSize === size ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedSize(size);
                  setMessage("");
                }}
              >
                {size}
              </button>
            ))}
          </div>

          <button className="size-guide-btn">SIZE GUIDE</button>

          <div className="quantity-row">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="detail-action-buttons">
            <button className="add-to-bag-btn" onClick={handleAddToBag}>
              ADD TO BAG — {formatPrice(product.price * quantity)}
            </button>

            <button
              className={`detail-wishlist-btn ${
                wishlist ? "wish-active" : ""
              }`}
              onClick={() => setWishlist(!wishlist)}
              aria-label="Toggle wishlist"
            >
              <Heart
                size={19}
                fill={wishlist ? "currentColor" : "none"}
              />
            </button>
          </div>

          {message && <p className="detail-message">{message}</p>}

          <div className="detail-description">
            <p>{product.description}</p>
          </div>

          <div className="product-specifications">
            <div>
              <span>Fabric</span>
              <span>{product.fabric}</span>
            </div>

            <div>
              <span>Fit</span>
              <span>{product.fit}</span>
            </div>

            <div>
              <span>Care</span>
              <span>{product.care}</span>
            </div>
          </div>

          <div className="product-service-list">
            <div>
              <Truck size={18} />
              <span>Delivery across Pakistan</span>
            </div>
            <div>
              <RotateCcw size={18} />
              <span>Returns on eligible items</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>Secure checkout experience</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
