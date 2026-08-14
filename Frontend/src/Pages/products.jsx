import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const PRODUCTS_PER_PAGE = 12;

const Products = ({
  adminPortal = true,
  onAddProduct,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const fetchProducts = async (pageNumber = 1) => {
    setError("");

    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("adminToken");

      const endpoint = adminPortal
        ? "/api/v1/foodcards/my"
        : "/api/v1/foodcards";

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        {
          params: {
            page: pageNumber,
            limit: PRODUCTS_PER_PAGE,
          },
          headers: adminPortal
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const responseData = res.data?.data;

      let newProducts = [];
      let pagination = {};

      if (Array.isArray(responseData)) {
        newProducts = responseData;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        if (Array.isArray(responseData.products)) {
          newProducts = responseData.products;
        } else if (
          Array.isArray(responseData.foodcards)
        ) {
          newProducts = responseData.foodcards;
        } else if (Array.isArray(responseData.items)) {
          newProducts = responseData.items;
        }

        pagination = responseData.pagination || {};
      }

      if (pageNumber === 1) {
        setProducts(newProducts);
      } else {
        setProducts((previous) => [
          ...(Array.isArray(previous) ? previous : []),
          ...newProducts,
        ]);
      }

      setPage(pageNumber);

      setHasMore(
        pagination?.hasMore ??
          pagination?.hasNext ??
          false
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load products."
      );

      if (pageNumber === 1) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;

    fetchProducts(page + 1);
  };

  const handleDelete = async (product) => {
    const productId = product?._id || product?.id;

    if (!productId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name}"?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) =>
            (item?._id || item?.id) !== productId
        )
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let result = [...products];

    if (category !== "All") {
      result = result.filter(
        (product) =>
          product?.category?.toLowerCase() ===
          category.toLowerCase()
      );
    }

    const searchValue = debouncedSearch.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name =
          product?.name?.toLowerCase() || "";

        const description =
          product?.description?.toLowerCase() || "";

        const productCategory =
          product?.category?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          productCategory.includes(searchValue)
        );
      });
    }

    if (stockFilter === "In Stock") {
      result = result.filter(
        (product) =>
          product?.isAvailable !== false &&
          Number(product?.quantity ?? 0) > 10
      );
    }

    if (stockFilter === "Low Stock") {
      result = result.filter(
        (product) =>
          product?.isAvailable !== false &&
          Number(product?.quantity ?? 0) > 0 &&
          Number(product?.quantity ?? 0) <= 10
      );
    }

    if (stockFilter === "Out of Stock") {
      result = result.filter(
        (product) =>
          product?.isAvailable === false ||
          Number(product?.quantity ?? 0) === 0
      );
    }

    if (ratingFilter > 0) {
      result = result.filter(
        (product) =>
          Number(product?.rating ?? 0) >=
          Number(ratingFilter)
      );
    }

    result = result.filter(
      (product) =>
        Number(product?.price ?? 0) <=
        Number(priceRange)
    );

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a?.price ?? 0) -
          Number(b?.price ?? 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b?.price ?? 0) -
          Number(a?.price ?? 0)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating ?? 0) -
          Number(a?.rating ?? 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a?.name ?? "").localeCompare(
          b?.name ?? ""
        )
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(
            b?.createdAt ?? 0
          ).getTime() -
          new Date(
            a?.createdAt ?? 0
          ).getTime()
      );
    }

    return result;
  }, [
    products,
    debouncedSearch,
    search,
    category,
    stockFilter,
    ratingFilter,
    priceRange,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStockFilter("All");
    setRatingFilter(0);
    setPriceRange(5000);
    setSortBy("newest");
  };

  const getStockStatus = (product) => {
    const quantity = Number(product?.quantity || 0);

    if (
      product?.isAvailable === false ||
      quantity === 0
    ) {
      return {
        text: "Out of stock",
        className:
          "border-red-100 bg-red-50 text-red-600",
      };
    }

    if (quantity <= 10) {
      return {
        text: `${quantity} left`,
        className:
          "border-amber-100 bg-amber-50 text-amber-600",
      };
    }

    return {
      text: "In stock",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-600",
    };
  };

  const ProductSkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
      <div className="aspect-[1/0.9] animate-pulse bg-slate-100" />

      <div className="space-y-3 p-3 sm:p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );

  const ProductCard = ({ product }) => {
    const stock = getStockStatus(product);
    const productId = product?._id || product?.id;

    const handleCardClick = () => {
      if (!productId) return;

      if (adminPortal) {
        navigate(`/admin/product/${productId}`);
      } else {
        navigate(`/product/${productId}`);
      }
    };

    const handleView = (event) => {
      event.stopPropagation();

      if (onView) {
        onView(product);
        return;
      }

      handleCardClick();
    };

    const handleEdit = (event) => {
      event.stopPropagation();

      if (onEdit) {
        onEdit(product);
        return;
      }

      if (productId) {
        navigate(
          `/admin/edit-product/${productId}`
        );
      }
    };

    const handleDeleteClick = (event) => {
      event.stopPropagation();
      handleDelete(product);
    };

    return (
      <article
        onClick={handleCardClick}
        className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-all duration-300 active:scale-[0.985] sm:rounded-3xl sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
      >
        <div className="relative aspect-[1/0.88] overflow-hidden bg-slate-100">
          {product?.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product?.name || "Product"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
            />
          ) : product?.image ? (
            <img
              src={product.image}
              alt={product?.name || "Product"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl">
              📦
            </div>
          )}

          <div className="absolute left-2 top-2 max-w-[45%] truncate rounded-full bg-white/95 px-2.5 py-1.5 text-[8px] font-bold text-slate-700 shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
            {product?.category || "Other"}
          </div>

          <div
            className={`absolute right-2 top-2 rounded-full border px-2 py-1.5 text-[8px] font-semibold sm:right-3 sm:top-3 sm:px-3 sm:text-[10px] ${stock.className}`}
          >
            {stock.text}
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 sm:bottom-3 sm:left-auto sm:right-3">
            <button
              type="button"
              onClick={handleView}
              className="flex h-9 flex-1 items-center justify-center rounded-xl bg-white/95 text-xs shadow-md backdrop-blur transition hover:bg-white sm:h-9 sm:w-9 sm:flex-none"
              title="View product"
            >
              👁️
            </button>

            {adminPortal && (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex h-9 flex-1 items-center justify-center rounded-xl bg-white/95 text-xs shadow-md backdrop-blur transition hover:bg-amber-50 sm:h-9 sm:w-9 sm:flex-none"
                  title="Edit product"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="flex h-9 flex-1 items-center justify-center rounded-xl bg-white/95 text-xs shadow-md backdrop-blur transition hover:bg-red-50 sm:h-9 sm:w-9 sm:flex-none"
                  title="Delete product"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[11px] font-extrabold text-slate-900 sm:text-sm">
                {product?.name || "Unnamed Product"}
              </h3>

              <p className="mt-1 line-clamp-2 min-h-[30px] text-[9px] leading-4 text-slate-400 sm:min-h-[40px] sm:text-xs sm:leading-5">
                {product?.description ||
                  "No product description available."}
              </p>
            </div>

            <span className="shrink-0 text-xs font-extrabold text-slate-900 sm:text-base">
              ₹
              {Number(
                product?.price || 0
              ).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-400 sm:text-sm">
                ★
              </span>

              <span className="text-[9px] font-bold text-slate-700 sm:text-xs">
                {Number(
                  product?.rating || 0
                ).toFixed(1)}
              </span>

              <span className="text-[8px] text-slate-400 sm:text-[10px]">
                ({product?.reviewCount || 0})
              </span>
            </div>

            <span className="text-[8px] font-medium text-slate-400 sm:text-[10px]">
              {product?.quantity || 0} available
            </span>
          </div>
        </div>
      </article>
    );
  };

  const Filters = ({ mobile = false }) => (
    <div
      className={
        mobile
          ? "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Filters
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Refine your products
          </p>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="text-[10px] font-bold text-amber-600 hover:text-amber-700"
        >
          Clear all
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-800">
          Category
        </p>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-3 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        >
          <option value="All">All Categories</option>
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kids">Kids</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-800">
          Availability
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
          {[
            "All",
            "In Stock",
            "Low Stock",
            "Out of Stock",
          ].map((item) => (
            <label
              key={item}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-[10px] transition ${
                stockFilter === item
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-100 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={`stock-${mobile ? "mobile" : "desktop"}`}
                checked={stockFilter === item}
                onChange={() => setStockFilter(item)}
                className="h-3.5 w-3.5 accent-amber-500"
              />

              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">
            Maximum Price
          </p>

          <span className="text-xs font-bold text-amber-600">
            ₹{priceRange.toLocaleString("en-IN")}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={priceRange}
          onChange={(e) =>
            setPriceRange(Number(e.target.value))
          }
          className="mt-4 w-full accent-amber-500"
        />

        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          <span>₹0</span>
          <span>₹5,000+</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-800">
          Rating
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1 lg:grid-cols-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                setRatingFilter(
                  ratingFilter === rating ? 0 : rating
                )
              }
              className={`flex items-center gap-1.5 rounded-xl px-2 py-2 text-left transition ${
                ratingFilter === rating
                  ? "bg-amber-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="text-xs">
                <span className="text-amber-400">
                  {"★".repeat(rating)}
                </span>

                <span className="text-slate-200">
                  {"★".repeat(5 - rating)}
                </span>
              </span>

              <span className="text-[9px] text-slate-500">
                & up
              </span>
            </button>
          ))}
        </div>
      </div>

      {mobile && (
        <button
          type="button"
          onClick={() => setShowMobileFilters(false)}
          className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white"
        >
          Apply Filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fafaf9] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-lg shadow-amber-200 sm:h-14 sm:w-14 sm:text-2xl">
                🛍️
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600 sm:text-[10px]">
                  Product Management
                </p>

                <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
                  Products
                </h1>

                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                  Manage your e-commerce product catalog,
                  inventory and product details.
                </p>
              </div>
            </div>

            {adminPortal && (
              <button
                type="button"
                onClick={() =>
                  onAddProduct
                    ? onAddProduct()
                    : navigate("/admin")
                }
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:text-sm"
              >
                + Add Product
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, category..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 sm:h-12 sm:rounded-2xl sm:text-sm"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-amber-400 focus:bg-white sm:h-12 sm:w-52 sm:rounded-2xl sm:px-4 sm:text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="rating">
                Highest Rated
              </option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 sm:hidden"
          >
            ⚙️ Filters
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">
              {category !== "All" ||
              stockFilter !== "All" ||
              ratingFilter > 0 ||
              priceRange < 5000
                ? "Active"
                : ""}
            </span>
          </button>
        </header>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#fafaf9] p-4 shadow-2xl">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">
                  Filter Products
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow-sm"
                >
                  ✕
                </button>
              </div>

              <Filters mobile />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchProducts(1)}
              className="w-full rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 sm:w-auto"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-7">
          <aside className="hidden lg:block">
            <Filters />
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900 sm:text-base">
                  Product Catalog
                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Showing {filteredProducts.length}{" "}
                  loaded products
                </p>
              </div>

              <div className="hidden rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-sm sm:block">
                {category}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map(
                  (_, index) => (
                    <ProductSkeleton key={index} />
                  )
                )}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm sm:py-20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  🔎
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800 sm:text-base">
                  No products found
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  Try changing your search, category or
                  filter settings.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={
                        product?._id || product?.id
                      }
                      product={product}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center sm:mt-10">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px] sm:rounded-2xl sm:text-sm"
                    >
                      {loadingMore ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <span>↓</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="mt-8 text-center sm:mt-10">
                    <div className="mx-auto mb-2 h-px max-w-xs bg-slate-200" />

                    <p className="pt-2 text-[10px] text-slate-400 sm:text-xs">
                      You've reached the end of the
                      product catalog.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Products;