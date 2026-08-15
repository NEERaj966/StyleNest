import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "Women",
    description: "",
    imageUrl: "",
    isAvailable: true,
  });

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data?.data;

        const product =
          data?.product ||
          data?.foodcard ||
          data?.item ||
          data;

        if (!product) {
          throw new Error("Product not found");
        }

        setForm({
          name: product.name || "",
          price: product.price ?? "",
          quantity: product.quantity ?? "",
          category: product.category || "Women",
          description: product.description || "",
          imageUrl: product.imageUrl || product.image || "",
          isAvailable: product.isAvailable !== false,
        });
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("adminToken");

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/admin/menu");
    } catch (error) {
      console.error("Failed to update product:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eee8de] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-8 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
            <div className="h-8 w-48 animate-pulse rounded bg-[#e5ded3]" />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="h-12 animate-pulse rounded-xl bg-[#e5ded3]" />
              <div className="h-12 animate-pulse rounded-xl bg-[#e5ded3]" />
              <div className="h-12 animate-pulse rounded-xl bg-[#e5ded3]" />
              <div className="h-12 animate-pulse rounded-xl bg-[#e5ded3]" />
            </div>

            <div className="mt-6 h-32 animate-pulse rounded-xl bg-[#e5ded3]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#eee8de] px-5 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-[0_10px_28px_rgba(36,33,29,0.06)] shadow-amber-200">
                ✏️
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#24211d]">
                  Edit Product
                </h1>

                <p className="mt-1 text-sm text-[#746b61]">
                  Update your product information
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/menu")}
            className="
              rounded-xl
              border
              border-[#d5cec2]
              bg-[#f8f4ec]
              px-4
              py-2.5
              text-sm
              font-semibold
              text-[#5d554c]
              shadow-[0_3px_12px_rgba(36,33,29,0.04)]
              transition
              hover:bg-[#eee8de]
            "
          >
            ← Back to Products
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_3px_12px_rgba(36,33,29,0.04)]"
        >
          {/* FORM HEADER */}
          <div className="border-b border-[#e0d8cd] px-6 py-5 md:px-8">
            <h2 className="text-base font-bold text-[#24211d]">
              Product Information
            </h2>

            <p className="mt-1 text-xs text-[#877d72]">
              Update the details of this product.
            </p>
          </div>

          <div className="space-y-7 p-6 md:p-8">

            {/* NAME + CATEGORY */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#d5cec2]
                    bg-[#f8f4ec]
                    px-4
                    text-sm
                    text-[#302b26]
                    outline-none
                    transition
                    placeholder:text-[#877d72]
                    focus:border-amber-400
                    focus:ring-4
                    focus:ring-amber-100
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#d5cec2]
                    bg-[#f8f4ec]
                    px-4
                    text-sm
                    text-[#3e3730]
                    outline-none
                    focus:border-amber-400
                    focus:ring-4
                    focus:ring-amber-100
                  "
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* PRICE + QUANTITY */}
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                  Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#877d72]">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#d5cec2]
                      bg-[#f8f4ec]
                      pl-9
                      pr-4
                      text-sm
                      text-[#302b26]
                      outline-none
                      focus:border-amber-400
                      focus:ring-4
                      focus:ring-amber-100
                    "
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#d5cec2]
                    bg-[#f8f4ec]
                    px-4
                    text-sm
                    text-[#302b26]
                    outline-none
                    focus:border-amber-400
                    focus:ring-4
                    focus:ring-amber-100
                  "
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Enter product description..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[#d5cec2]
                  bg-[#f8f4ec]
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-[#302b26]
                  outline-none
                  transition
                  placeholder:text-[#877d72]
                  focus:border-amber-400
                  focus:ring-4
                  focus:ring-amber-100
                "
              />
            </div>

            {/* IMAGE URL */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[#3e3730]">
                Product Image URL
              </label>

              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#d5cec2]
                  bg-[#f8f4ec]
                  px-4
                  text-sm
                  text-[#302b26]
                  outline-none
                  transition
                  placeholder:text-[#877d72]
                  focus:border-amber-400
                  focus:ring-4
                  focus:ring-amber-100
                "
              />

              {/* IMAGE PREVIEW */}
              {form.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#d5cec2] bg-[#eee8de]">
                  <img
                    src={form.imageUrl}
                    alt={form.name || "Product preview"}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* AVAILABILITY */}
            <div className="rounded-xl border border-[#e0d8cd] bg-[#eee8de] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#302b26]">
                    Product Availability
                  </p>

                  <p className="mt-1 text-xs text-[#877d72]">
                    Allow customers to purchase this product.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-5 w-5 accent-amber-500"
                />
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#e0d8cd] bg-[#eee8de] px-6 py-5 sm:flex-row sm:justify-end md:px-8">

            <button
              type="button"
              onClick={() => navigate("/admin/menu")}
              disabled={saving}
              className="
                rounded-xl
                border
                border-[#d5cec2]
                bg-[#f8f4ec]
                px-6
                py-3
                text-sm
                font-semibold
                text-[#5d554c]
                transition
                hover:bg-[#eee8de]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#f2e4dc]0
                px-7
                py-3
                text-sm
                font-bold
                text-[#f8f4ec]
                shadow-[0_3px_12px_rgba(36,33,29,0.04)]
                transition
                hover:bg-[#984126]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/40
                      border-t-white
                    "
                  />

                  Saving...
                </>
              ) : (
                <>
                  ✓ Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;