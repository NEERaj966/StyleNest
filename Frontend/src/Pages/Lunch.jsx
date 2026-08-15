import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const PRODUCTS_PER_PAGE = 12;

const Products = ({
  adminPortal = false,
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
  const [category, setCategory] = useState("Men");
  const [stockFilter, setStockFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState("newest");
  const debouncedSearch = useDebounce(search, 500);

  const fetchProducts = async (pageNumber = 1) => {
    setError("");

    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards`,
        {
          params: {
            page: pageNumber,
            limit: PRODUCTS_PER_PAGE,
          },
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
        } else if (Array.isArray(responseData.foodcards)) {
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
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load products."
      );

      setProducts([]);
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

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let result = [...products];

    if (category && category !== "All") {
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

        const productSizes = Array.isArray(product?.sizes)
          ? product.sizes.join(" ").toLowerCase()
          : "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          productCategory.includes(searchValue) ||
          productSizes.includes(searchValue)
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
        text: "Out",
        desktopText: "Out of stock",
        className:
          "border-rose-200 bg-rose-50 text-rose-600",
        dot: "bg-rose-500",
      };
    }

    if (quantity <= 10) {
      return {
        text: `${quantity} left`,
        desktopText: `${quantity} left`,
        className:
          "border-[#d9b6a8] bg-[#f2e4dc] text-[#8f3d25]",
        dot: "bg-[#f2e4dc]0",
      };
    }

    return {
      text: "In stock",
      desktopText: "In stock",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    };
  };

  const ProductSkeleton = () => (
    <div className="overflow-hidden rounded-xl border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:rounded-[22px]">
      <div className="aspect-[0.88] animate-pulse bg-[#e5ded3] sm:aspect-[4/3]" />

      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#e5ded3]" />

        <div className="h-3 w-full animate-pulse rounded bg-[#e5ded3]" />

        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-16 animate-pulse rounded bg-[#e5ded3]" />
          <div className="h-4 w-12 animate-pulse rounded bg-[#e5ded3]" />
        </div>

        <div className="h-2.5 w-full animate-pulse rounded bg-[#e5ded3]" />
      </div>
    </div>
  );

  const ProductCard = ({ product }) => {
    const stock = getStockStatus(product);

    const image =
      product?.imageUrl ||
      product?.image ||
      null;

    const handleProductClick = () => {
      const productId = product?._id;

      if (!productId) return;

      navigate(`/product/${productId}`);
    };

    return (
      <article
        onClick={handleProductClick}
        className="group cursor-pointer overflow-hidden rounded-xl border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_3px_16px_rgba(15,23,42,0.05)] transition-all duration-300 active:scale-[0.985] sm:rounded-[22px] sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
      >
        <div className="relative aspect-[0.88] overflow-hidden bg-[#e5ded3] sm:aspect-[4/3]">
          {image ? (
            <img
              src={image}
              alt={product?.name || "Product"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl sm:text-5xl">
              📦
            </div>
          )}

          <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-1.5 sm:left-3 sm:right-3 sm:top-3">
            <span className="max-w-[48%] truncate rounded-full border border-white/70 bg-[#f8f4ec]/90 px-2 py-1 text-[7px] font-bold uppercase tracking-wide text-[#3e3730] shadow-[0_3px_12px_rgba(36,33,29,0.04)] backdrop-blur sm:px-2.5 sm:py-1.5 sm:text-[9px]">
              {product?.category || "Other"}
            </span>

            <span
              className={`flex max-w-[48%] items-center gap-1 rounded-full border px-2 py-1 text-[7px] font-bold shadow-[0_3px_12px_rgba(36,33,29,0.04)] backdrop-blur sm:px-2.5 sm:py-1.5 sm:text-[9px] ${stock.className}`}
            >
              <span
                className={`h-1 w-1 shrink-0 rounded-full sm:h-1.5 sm:w-1.5 ${stock.dot}`}
              />

              <span className="sm:hidden">
                {stock.text}
              </span>

              <span className="hidden sm:inline">
                {stock.desktopText}
              </span>
            </span>
          </div>

          {adminPortal && (
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="absolute bottom-2 right-2 flex gap-1.5 sm:bottom-3 sm:right-3 sm:gap-2"
            >
              <button
                type="button"
                onClick={() => onView?.(product)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8f4ec]/95 text-[10px] shadow-[0_10px_28px_rgba(36,33,29,0.06)] backdrop-blur transition hover:bg-[#eee8de] sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm"
                title="View product"
              >
                👁
              </button>

              <button
                type="button"
                onClick={() => onEdit?.(product)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8f4ec]/95 text-[10px] shadow-[0_10px_28px_rgba(36,33,29,0.06)] backdrop-blur transition hover:bg-[#f2e4dc] sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm"
                title="Edit product"
              >
                ✏️
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(product)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8f4ec]/95 text-[10px] shadow-[0_10px_28px_rgba(36,33,29,0.06)] backdrop-blur transition hover:bg-rose-50 sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm"
                title="Delete product"
              >
                🗑
              </button>
            </div>
          )}
        </div>

        <div className="p-2.5 sm:p-4">
          <h3 className="truncate text-[11px] font-bold text-[#24211d] sm:text-sm">
            {product?.name || "Unnamed Product"}
          </h3>

          <p className="mt-1 hidden line-clamp-2 text-xs leading-5 text-[#877d72] sm:block">
            {product?.description ||
              "No description available."}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-1 sm:mt-4">
            <span className="text-sm font-extrabold tracking-tight text-[#24211d] sm:text-base">
              ₹
              {Number(
                product?.price || 0
              ).toLocaleString("en-IN")}
            </span>

            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-amber-400 sm:text-sm">
                ★
              </span>

              <span className="text-[9px] font-bold text-[#3e3730] sm:text-xs">
                {Number(
                  product?.rating || 0
                ).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-2 border-t border-[#e0d8cd] pt-2 sm:mt-3 sm:pt-3">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[8px] text-[#877d72] sm:text-[10px]">
                {product?.reviewCount || 0} reviews
              </span>

              <span className="truncate text-[8px] font-medium text-[#877d72] sm:text-[10px]">
                {product?.quantity || 0} available
              </span>
            </div>
          </div>

          {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
            <p className="mt-2 truncate text-[8px] font-semibold uppercase tracking-wide text-[#877d72] sm:text-[10px]">
              Sizes: {product.sizes.join(", ")}
            </p>
          )}
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-10">
        {/* HEADER */}
        <header className="mb-5 sm:mb-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg shadow-[0_6px_18px_rgba(36,33,29,0.05)] shadow-amber-100 sm:h-12 sm:w-12 sm:text-xl">
                🛍️
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#984126] sm:text-[10px]">
                  StyleNest Collection
                </p>

                <h1 className="mt-0.5 truncate text-xl font-black tracking-tight text-[#24211d] sm:text-3xl">
                  Products
                </h1>

                <p className="mt-1 hidden text-sm text-[#746b61] sm:block">
                  Discover and manage your store collection
                </p>
              </div>
            </div>

            {adminPortal && (
              <button
                type="button"
                onClick={() => onAddProduct?.()}
                className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#24211d] px-3 text-xs font-bold text-[#f8f4ec] shadow-[0_6px_18px_rgba(36,33,29,0.05)] transition active:scale-95 sm:h-12 sm:rounded-xl sm:px-5 sm:text-sm"
              >
                <span className="mr-1 text-base sm:text-lg">
                  +
                </span>

                <span className="hidden sm:inline">
                  Add Product
                </span>

                <span className="sm:hidden">
                  Add
                </span>
              </button>
            )}
          </div>
        </header>

        {/* SEARCH + SORT */}
        <section className="mb-4 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-2.5 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:rounded-[24px] sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#877d72]">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] pl-10 pr-3 text-xs text-[#302b26] outline-none transition placeholder:text-[#877d72] focus:border-amber-400 focus:bg-[#f8f4ec] focus:ring-2 focus:ring-amber-50 sm:h-12 sm:rounded-xl sm:text-sm"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-3 text-xs font-semibold text-[#5d554c] outline-none transition focus:border-amber-400 focus:bg-[#f8f4ec] sm:h-12 sm:w-auto sm:min-w-[170px] sm:rounded-xl sm:px-4 sm:text-sm"
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

              <option value="name">
                Name A-Z
              </option>
            </select>
          </div>
        </section>

        {/* MOBILE FILTER BAR */}
        <div className="mb-5 lg:hidden">
          <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:-mx-5 sm:px-5">
            <div className="flex w-max gap-2">
              {[
                ["All", "All"],
                ["In Stock", "In Stock"],
                ["Low Stock", "Low Stock"],
                ["Out of Stock", "Out of Stock"],
              ].map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStockFilter(value)
                  }
                  className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[10px] font-bold transition ${
                    stockFilter === value
                      ? "border-slate-950 bg-[#24211d] text-[#f8f4ec]"
                      : "border-[#d5cec2] bg-[#f8f4ec] text-[#5d554c]"
                  }`}
                >
                  {label}
                </button>
              ))}

              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setRatingFilter(
                      ratingFilter === rating
                        ? 0
                        : rating
                    )
                  }
                  className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[10px] font-bold transition ${
                    ratingFilter === rating
                      ? "border-amber-400 bg-[#f2e4dc] text-[#8f3d25]"
                      : "border-[#d5cec2] bg-[#f8f4ec] text-[#5d554c]"
                  }`}
                >
                  ★ {rating}+
                </button>
              ))}

              <button
                type="button"
                onClick={clearFilters}
                className="whitespace-nowrap rounded-full border border-[#d9b6a8] bg-[#f2e4dc] px-3.5 py-2 text-[10px] font-bold text-[#8f3d25]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:text-sm">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchProducts(1)}
              className="w-full rounded-xl bg-[#f8f4ec] px-4 py-2.5 text-xs font-bold text-rose-600 shadow-[0_3px_12px_rgba(36,33,29,0.04)] transition hover:bg-rose-100 sm:w-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden h-fit rounded-[28px] border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)] lg:sticky lg:top-6 lg:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#24211d]">
                  Filters
                </p>

                <p className="mt-1 text-[10px] text-[#877d72]">
                  Refine your results
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-bold text-[#984126] transition hover:text-[#8f3d25]"
              >
                Clear
              </button>
            </div>

            {/* AVAILABILITY */}
            <div className="mt-6 border-t border-[#e0d8cd] pt-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#746b61]">
                Availability
              </p>

              <div className="mt-3 space-y-1">
                {[
                  "All",
                  "In Stock",
                  "Low Stock",
                  "Out of Stock",
                ].map((item) => (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition ${
                      stockFilter === item
                        ? "bg-[#f2e4dc] text-[#8f3d25]"
                        : "text-[#5d554c] hover:bg-[#eee8de]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="stock"
                      checked={
                        stockFilter === item
                      }
                      onChange={() =>
                        setStockFilter(item)
                      }
                      className="h-4 w-4 accent-amber-500"
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="mt-6 border-t border-[#e0d8cd] pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#746b61]">
                  Maximum Price
                </p>

                <span className="text-xs font-extrabold text-[#984126]">
                  ₹
                  {priceRange.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(
                    Number(e.target.value)
                  )
                }
                className="mt-5 w-full accent-amber-500"
              />

              <div className="mt-2 flex justify-between text-[10px] text-[#877d72]">
                <span>₹0</span>
                <span>₹5,000+</span>
              </div>
            </div>

            {/* RATING */}
            <div className="mt-6 border-t border-[#e0d8cd] pt-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#746b61]">
                Customer Rating
              </p>

              <div className="mt-3 space-y-1">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setRatingFilter(
                        ratingFilter === rating
                          ? 0
                          : rating
                      )
                    }
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                      ratingFilter === rating
                        ? "bg-[#f2e4dc]"
                        : "hover:bg-[#eee8de]"
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

                    <span className="text-[10px] text-[#746b61]">
                      & up
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCTS AREA */}
          <section className="min-w-0">
            {/* RESULT HEADER */}
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#24211d] sm:text-lg">
                    All Products
                  </h2>

                  <span className="rounded-full bg-[#e5ded3] px-2 py-1 text-[9px] font-bold text-[#746b61]">
                    {filteredProducts.length}
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-[#877d72] sm:text-xs">
                  Showing matching products
                </p>
              </div>

              {category !== "All" && (
                <span className="rounded-full border border-amber-100 bg-[#f2e4dc] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#8f3d25] sm:px-3 sm:py-1.5 sm:text-[10px]">
                  {category}
                </span>
              )}
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="grid grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map(
                  (_, index) => (
                    <ProductSkeleton key={index} />
                  )
                )}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded-[24px] border border-[#d5cec2] bg-[#f8f4ec] px-5 py-16 text-center shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:rounded-[28px] sm:py-20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#e5ded3] text-2xl">
                  📦
                </div>

                <h3 className="mt-4 text-sm font-extrabold text-[#24211d] sm:text-base">
                  No products found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#877d72] sm:text-sm">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#24211d] px-4 py-2.5 text-xs font-bold text-[#f8f4ec] transition hover:bg-[#302b26]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* PRODUCT GRID */}
                <div className="grid grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={
                          product?._id ||
                          product?.id
                        }
                        product={product}
                      />
                    )
                  )}
                </div>

                {/* LOAD MORE */}
                {hasMore && (
                  <div className="mt-8 flex justify-center sm:mt-10">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] px-5 py-3 text-xs font-bold text-[#3e3730] shadow-[0_3px_12px_rgba(36,33,29,0.04)] transition hover:border-[#c99a89] hover:bg-[#f2e4dc] hover:text-[#8f3d25] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px] sm:rounded-xl sm:text-sm"
                    >
                      {loadingMore ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d5cec2] border-t-amber-500" />
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

                {/* END */}
                {!hasMore && products.length > 0 && (
                  <div className="mt-9 flex items-center justify-center gap-2 sm:mt-12 sm:gap-3">
                    <span className="h-px w-8 bg-[#d9d0c4] sm:w-16" />

                    <p className="text-[9px] font-medium text-[#877d72] sm:text-[11px]">
                      You've reached the end
                    </p>

                    <span className="h-px w-8 bg-[#d9d0c4] sm:w-16" />
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
