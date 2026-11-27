
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// AVAILABLE COUPONS
export const COUPONS = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrder: 2000,
    description: "10% off on orders above PKR 2,000",
  },
  {
    code: "RIVELUNE15",
    type: "percentage",
    value: 15,
    minOrder: 5000,
    description: "15% off on orders above PKR 5,000",
  },
  {
    code: "SAVE500",
    type: "fixed",
    value: 500,
    minOrder: 3000,
    description: "PKR 500 off on orders above PKR 3,000",
  },
];

export function CartProvider({ children }) {
  // CART
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("rivelune_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // WISHLIST
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("rivelune_wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  // APPLIED COUPON
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const savedCoupon = localStorage.getItem("rivelune_coupon");
      return savedCoupon ? JSON.parse(savedCoupon) : null;
    } catch {
      return null;
    }
  });

  // CART COUNT
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // CART TOTAL
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // SAVE CART
  useEffect(() => {
    localStorage.setItem("rivelune_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // SAVE WISHLIST
  useEffect(() => {
    localStorage.setItem(
      "rivelune_wishlist",
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);

  // SAVE COUPON
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(
        "rivelune_coupon",
        JSON.stringify(appliedCoupon)
      );
    } else {
      localStorage.removeItem("rivelune_coupon");
    }
  }, [appliedCoupon]);

  // ADD TO CART
  const addToCart = (product, size, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          color: product.color,
          size,
          quantity,
        },
      ];
    });
  };

  // REMOVE FROM CART
  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  // UPDATE CART QUANTITY
  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(id, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // APPLY COUPON
  const applyCoupon = (code) => {
    const normalizedCode = code.trim().toUpperCase();

    const coupon = COUPONS.find(
      (item) => item.code === normalizedCode
    );

    if (!coupon) {
      return {
        success: false,
        message: "Invalid coupon code.",
      };
    }

    if (cartTotal < coupon.minOrder) {
      return {
        success: false,
        message: `Minimum order of PKR ${coupon.minOrder.toLocaleString("en-PK")} required.`,
      };
    }

    setAppliedCoupon(coupon);

    return {
      success: true,
      message: `${coupon.code} applied successfully!`,
    };
  };

  // REMOVE COUPON
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // COUPON DISCOUNT
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? Math.round((cartTotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  // FINAL SUBTOTAL AFTER DISCOUNT
  const discountedTotal = Math.max(0, cartTotal - discountAmount);

  // ADD TO WISHLIST
  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const alreadyExists = prev.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) return prev;

      return [...prev, product];
    });
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = (id) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // CHECK WISHLIST PRODUCT
  const isInWishlist = (id) => {
    return wishlistItems.some((item) => item.id === id);
  };

  // TOGGLE WISHLIST
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // CLEAR WISHLIST
  const clearWishlist = () => setWishlistItems([]);

  // WISHLIST COUNT
  const wishlistCount = wishlistItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,

        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount,

        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        discountedTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
