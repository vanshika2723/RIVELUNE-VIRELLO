
import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Image,
  Package,
  LoaderCircle,
  Pencil,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialForm = {
  sku: "",
  name: "",
  description: "",
  category_id: "",
  price: "",
  sale_price: "",
  fabric: "",
  fit: "",
  care_instructions: "",
  stock: "0",
  image_url: "",
  image_alt: "",
  is_active: 1,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-slate-600";

const AdminAddProductModal = ({
  product = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = Boolean(product);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // ==========================================
  // LOAD PRODUCT DATA FOR EDIT
  // ==========================================
  useEffect(() => {
    if (!product) {
      setForm(initialForm);
      setVariants([]);
      setError("");
      return;
    }

    setForm({
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      category_id: String(product.category_id ?? ""),
      price: String(product.price ?? ""),
      sale_price:
        product.sale_price == null
          ? ""
          : String(product.sale_price),
      fabric: product.fabric || "",
      fit: product.fit || "",
      care_instructions: product.care_instructions || "",
      stock: String(product.stock ?? 0),
      image_url: product.image_url || product.main_image || "",
      image_alt: product.image_alt || "",
      is_active: Number(product.is_active) === 1 ? 1 : 0,
    });

    setVariants(
      (product.variants || []).map((variant) => ({
        size: variant.size || "",
        color: variant.color || "",
        variant_sku: variant.variant_sku || "",
        price_override:
          variant.price_override == null
            ? ""
            : String(variant.price_override),
        stock_quantity: String(variant.stock_quantity ?? 0),
        is_active: Number(variant.is_active) === 1 ? 1 : 0,
      }))
    );

    setError("");
  }, [product]);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/products/categories`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load categories.");
        }

        setCategories(data.categories || []);
      } catch (err) {
        setCategoryError(err.message || "Failed to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================
  // FORM HANDLER
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // VARIANT HANDLERS
  // ==========================================
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "",
        color: "",
        variant_sku: "",
        price_override: "",
        stock_quantity: "0",
        is_active: 1,
      },
    ]);
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // SUBMIT PRODUCT - CREATE / UPDATE
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = sessionStorage.getItem("rivelune_admin_token");

    if (!token) {
      setError("Your admin session has expired. Please log in again.");
      return;
    }

    if (!form.sku.trim() || !form.name.trim() || form.price === "") {
      setError("SKU, product name and price are required.");
      return;
    }

    if (
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("Please enter a valid non-negative regular price.");
      return;
    }

    if (
      form.sale_price !== "" &&
      (!Number.isFinite(Number(form.sale_price)) ||
        Number(form.sale_price) < 0 ||
        Number(form.sale_price) > Number(form.price))
    ) {
      setError("Sale price must be valid and cannot exceed regular price.");
      return;
    }

    if (
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    for (const variant of variants) {
      if (!variant.size.trim() || !variant.color.trim()) {
        setError("Every variant needs a size and color.");
        return;
      }

      if (
        !Number.isInteger(Number(variant.stock_quantity)) ||
        Number(variant.stock_quantity) < 0
      ) {
        setError("Variant stock must be a non-negative whole number.");
        return;
      }

      if (
        variant.price_override !== "" &&
        (!Number.isFinite(Number(variant.price_override)) ||
          Number(variant.price_override) < 0)
      ) {
        setError("Variant price must be a valid non-negative number.");
        return;
      }
    }

    const payload = {
      ...form,
      category_id: form.category_id || null,
      price: Number(form.price),
      sale_price:
        form.sale_price === "" ? null : Number(form.sale_price),
      stock: Number(form.stock),
      is_active: Number(form.is_active),
      image_url: form.image_url.trim(),
      image_alt: form.image_alt.trim(),
      variants: variants.map((variant) => ({
        ...variant,
        size: variant.size.trim(),
        color: variant.color.trim(),
        variant_sku: variant.variant_sku.trim(),
        price_override:
          variant.price_override === ""
            ? null
            : Number(variant.price_override),
        stock_quantity: Number(variant.stock_quantity),
        is_active: Number(variant.is_active),
      })),
    };

    setSaving(true);

    try {
      const url = isEditMode
        ? `${API_URL}/products/${product.id}`
        : `${API_URL}/products`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("rivelune_admin_token");
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditMode
              ? "Failed to update product."
              : "Failed to create product.")
        );
      }

      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CATEGORY DISPLAY
  // ==========================================
  const parentCategories = categories.filter(
    (category) => category.parent_id == null
  );

  const getCategoryLabel = (category) => {
    const parent = categories.find(
      (item) => Number(item.id) === Number(category.parent_id)
    );

    return parent
      ? `${parent.name} / ${category.name}`
      : category.name;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={saving ? undefined : onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                {isEditMode ? <Pencil size={17} /> : <Package size={17} />}
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {isEditMode
                ? "Update product information, pricing, images and variants."
                : "Add product information, pricing, images and variants."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-5 py-5 sm:px-7">
            {error && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Basic Details */}
            <section>
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Cotton Shirt"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Product SKU *</label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. RV-MEN-SH-001"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={loadingCategories}
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {parentCategories.map((parent) => {
                      const children = categories.filter(
                        (category) =>
                          Number(category.parent_id) === Number(parent.id)
                      );

                      return (
                        <optgroup key={parent.id} label={parent.name}>
                          {children.map((category) => (
                            <option key={category.id} value={category.id}>
                              {getCategoryLabel(category)}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>

                  {categoryError && (
                    <p className="mt-1 text-xs text-rose-500">
                      {categoryError}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Product Status</label>
                  <select
                    name="is_active"
                    value={form.is_active}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the product..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </section>

            {/* Pricing & Stock */}
            <section className="mt-7 border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Regular Price (PKR) *</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Sale Price (PKR)</label>
                  <input
                    name="sale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={handleChange}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Attributes */}
            <section className="mt-7 border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Product Attributes
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Fabric</label>
                  <input
                    name="fabric"
                    value={form.fabric}
                    onChange={handleChange}
                    placeholder="e.g. 100% Cotton"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Fit</label>
                  <input
                    name="fit"
                    value={form.fit}
                    onChange={handleChange}
                    placeholder="e.g. Regular Fit"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Care Instructions</label>
                <textarea
                  name="care_instructions"
                  value={form.care_instructions}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Machine wash cold, do not bleach."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </section>

            {/* Image */}
            <section className="mt-7 border-t border-slate-100 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Image size={16} />
                Product Image
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Image Alt Text</label>
                  <input
                    name="image_alt"
                    value={form.image_alt}
                    onChange={handleChange}
                    placeholder="Describe the image"
                    className={inputClass}
                  />
                </div>
              </div>

              {form.image_url && (
                <div className="mt-3 h-36 w-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={form.image_url}
                    alt={form.image_alt || form.name || "Product preview"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </section>

            {/* Variants */}
            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Size & Color Variants
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Add optional size and color combinations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus size={14} />
                  Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <Package size={20} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-xs text-slate-500">
                    No variants added. You can create the product without variants.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700">
                          Variant {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50"
                          title="Remove variant"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelClass}>Size *</label>
                          <input
                            value={variant.size}
                            onChange={(e) =>
                              updateVariant(index, "size", e.target.value)
                            }
                            placeholder="S, M, L, XL"
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Color *</label>
                          <input
                            value={variant.color}
                            onChange={(e) =>
                              updateVariant(index, "color", e.target.value)
                            }
                            placeholder="Black"
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Variant SKU</label>
                          <input
                            value={variant.variant_sku}
                            onChange={(e) =>
                              updateVariant(index, "variant_sku", e.target.value)
                            }
                            placeholder="Optional SKU"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Stock Quantity</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.stock_quantity}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "stock_quantity",
                                e.target.value
                              )
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Price Override</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price_override}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "price_override",
                                e.target.value
                              )
                            }
                            placeholder="Optional"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Variant Status</label>
                          <select
                            value={variant.is_active}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "is_active",
                                Number(e.target.value)
                              )
                            }
                            className={inputClass}
                          >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingCategories}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  {isEditMode ? <Pencil size={16} /> : <Plus size={16} />}
                  {isEditMode ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProductModal;
