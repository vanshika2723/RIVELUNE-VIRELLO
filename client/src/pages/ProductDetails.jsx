
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import products from "../data/products";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [message, setMessage] = useState("");

  const formatPrice = (price) =>
    `PKR ${Number(price).toLocaleString("en-PK")}`;

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <h2 className="font-serif text-3xl text-stone-800">
          Product not found
        </h2>

        <p className="mt-3 text-sm text-stone-500">
          This product may no longer be available.
        </p>

        <Link
          to="/"
          className="mt-7 bg-stone-900 px-8 py-3 text-xs tracking-[2px] text-white hover:bg-stone-700 transition"
        >
          RETURN TO HOMEPAGE
        </Link>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(
        ((product.oldPrice - product.price) /
          product.oldPrice) *
          100
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
    <main className="min-h-screen bg-white px-4 py-8 text-stone-900 sm:px-8 lg:px-12 lg:py-12">

      <div className="mx-auto max-w-[1400px]">

        {/* Breadcrumb */}

        <div className="mb-8 flex flex-wrap items-center gap-2 text-[10px] tracking-[2px] text-stone-400">
          <Link
            to="/"
            className="transition hover:text-stone-900"
          >
            HOME
          </Link>

          <span>/</span>

          <span>{product.category}</span>

          <span>/</span>

          <span className="text-stone-800">
            {product.name.toUpperCase()}
          </span>
        </div>

        {/* Product Layout */}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Product Gallery */}

          <div>

            <div className="relative overflow-hidden bg-[#f4f1ec]">

              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-[420px] w-full object-cover sm:h-[550px] lg:h-[680px]"
              />

              <span className="absolute left-5 top-5 bg-white px-4 py-2 text-[9px] tracking-[2px] text-stone-800">
                NEW SEASON
              </span>

            </div>

            {/* Thumbnails */}

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">

              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-24 w-20 shrink-0 overflow-hidden border transition sm:h-28 sm:w-24 ${
                    selectedImage === index
                      ? "border-stone-800"
                      : "border-transparent hover:border-stone-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}

            </div>
          </div>

          {/* Product Information */}

          <div className="lg:sticky lg:top-24 lg:self-start">

            <p className="text-[10px] tracking-[3px] text-stone-400">
              {product.category}
            </p>

            <h1 className="mt-4 font-serif text-3xl font-normal leading-tight sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>

            {/* Price */}

            <div className="mt-6 flex flex-wrap items-center gap-4">

              <span className="text-xl font-medium">
                {formatPrice(product.price)}
              </span>

              {product.oldPrice && (
                <>
                  <span className="text-base text-stone-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>

                  <span className="text-xs tracking-wider text-[#9a7651]">
                    -{discount}%
                  </span>
                </>
              )}

            </div>

            <p className="mt-2 text-xs text-stone-400">
              Inclusive of all applicable taxes.
            </p>

            <div className="my-8 h-px bg-stone-200" />

            {/* Color */}

            <div className="flex items-center justify-between">

              <p className="text-sm">
                Color:{" "}
                <span className="font-medium">
                  {product.color}
                </span>
              </p>

              <div
                className="h-7 w-7 rounded-full border border-stone-300"
                style={{
                  backgroundColor: product.colorCode,
                }}
                title={product.color}
              />

            </div>

            {/* Size Selection */}

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">

                <p className="text-[11px] font-medium tracking-[2px]">
                  SELECT SIZE
                </p>

                <button className="text-[10px] tracking-wider text-stone-500 underline underline-offset-4 hover:text-black">
                  SIZE GUIDE
                </button>

              </div>

              <div className="grid grid-cols-4 gap-3">

                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setMessage("");
                    }}
                    className={`h-12 border text-sm transition ${
                      selectedSize === size
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-700 hover:border-stone-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}

              </div>

            </div>

            {/* Quantity */}

            <div className="mt-8 flex items-center justify-between">

              <span className="text-sm">
                Quantity
              </span>

              <div className="flex h-11 items-center border border-stone-200">

                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  aria-label="Decrease quantity"
                  className="flex h-full w-11 items-center justify-center text-stone-600 hover:bg-stone-100"
                >
                  <Minus size={14} />
                </button>

                <span className="w-10 text-center text-sm">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((q) => q + 1)
                  }
                  aria-label="Increase quantity"
                  className="flex h-full w-11 items-center justify-center text-stone-600 hover:bg-stone-100"
                >
                  <Plus size={14} />
                </button>

              </div>

            </div>

            {/* Action Buttons */}

            <div className="mt-8 flex gap-3">

              <button
                onClick={handleAddToBag}
                className="flex-1 bg-stone-900 px-5 py-4 text-[11px] font-medium tracking-[2px] text-white transition hover:bg-stone-700"
              >
                ADD TO BAG —{" "}
                {formatPrice(product.price * quantity)}
              </button>

              <button
                onClick={() => setWishlist(!wishlist)}
                aria-label="Toggle wishlist"
                className={`flex h-[54px] w-[56px] shrink-0 items-center justify-center border transition ${
                  wishlist
                    ? "border-stone-900 text-stone-900"
                    : "border-stone-200 text-stone-700 hover:border-stone-900"
                }`}
              >
                <Heart
                  size={20}
                  fill={wishlist ? "currentColor" : "none"}
                />
              </button>

            </div>

            {/* Message */}

            {message && (
              <div className="mt-4 flex items-center gap-2 bg-[#f5f2ed] p-4 text-sm text-stone-700">
                <Check size={17} />
                {message}
              </div>
            )}

            {/* Description */}

            <div className="mt-9 border-t border-stone-200 pt-7">

              <p className="text-sm leading-7 text-stone-600">
                {product.description}
              </p>

            </div>

            {/* Specifications */}

            <div className="mt-7 space-y-4 border-t border-stone-200 pt-6">

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-stone-400">Fabric</span>
                <span className="text-right">
                  {product.fabric}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-stone-400">Fit</span>
                <span className="text-right">
                  {product.fit}
                </span>
              </div>

              <div className="flex justify-between gap-5 text-sm">
                <span className="text-stone-400">Care</span>
                <span className="max-w-[65%] text-right">
                  {product.care}
                </span>
              </div>

            </div>

            {/* Services */}

            <div className="mt-8 space-y-5 border-t border-stone-200 pt-7">

              <div className="flex items-center gap-4 text-sm text-stone-600">
                <Truck size={19} strokeWidth={1.5} />
                <span>Delivery across Pakistan</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-stone-600">
                <RotateCcw size={19} strokeWidth={1.5} />
                <span>Returns on eligible items</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-stone-600">
                <ShieldCheck size={19} strokeWidth={1.5} />
                <span>Secure checkout experience</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
