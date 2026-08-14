import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { OrderDataContext } from "../Context/OrderDataContext.js";

const Favorites = () => {
  const { addToCart } = useContext(OrderDataContext);
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setFavorites(res.data?.data ?? []);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load favorites."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/favorites/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setFavorites(res.data?.data ?? []);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to remove favorite."
      );
    }
  };

  const handleOrderNow = (item) => {
    addToCart(item);
    navigate("/orders");
  };

  const token = localStorage.getItem("token");

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-amber-100 sm:h-16 sm:w-16 sm:text-3xl">
              ❤️
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 sm:text-xs">
                Your Collection
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Favorites
              </h1>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm">
                Keep your favorite Products close and
                reorder them whenever you want.
              </p>
            </div>
          </div>

          {token && !isLoading && favorites.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {favorites.length}{" "}
              {favorites.length === 1
                ? "favorite"
                : "favorites"}{" "}
              saved
            </div>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-6 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* NOT LOGGED IN */}
          {!token ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                🔐
              </div>

              <h2 className="mt-5 text-base font-extrabold text-slate-900 sm:text-lg">
                Login to see your favorites
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
                Sign in to access your saved dishes
                and reorder them quickly.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:w-auto sm:min-w-[160px] sm:text-sm"
              >
                Login
              </button>
            </div>
          ) : isLoading ? (
            /* LOADING */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
                  >
                    <div className="aspect-[1/0.85] animate-pulse bg-slate-100" />

                    <div className="space-y-3 p-3 sm:p-4">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />

                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />

                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                      <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />

                      <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : error ? (
            /* ERROR */
            <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                ⚠️
              </div>

              <h2 className="mt-5 text-base font-extrabold text-slate-900">
                Something went wrong
              </h2>

              <p className="mt-2 text-xs leading-5 text-rose-600 sm:text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchFavorites}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] sm:text-sm"
              >
                Try Again
              </button>
            </div>
          ) : favorites.length === 0 ? (
            /* EMPTY */
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-4xl">
                ♡
              </div>

              <h2 className="mt-5 text-lg font-extrabold text-slate-900 sm:text-xl">
                No favorites yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
                Tap the heart icon on a dish to save it
                here for quick access later.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-400 active:scale-[0.98] sm:text-sm"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <>
              {/* SECTION HEADER */}
              <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 sm:text-xs">
                    Saved for later
                  </p>

                  <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-2xl">
                    Your saved dishes
                  </h2>
                </div>

                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[9px] font-bold text-white sm:px-4 sm:py-2 sm:text-xs">
                  {favorites.length} items
                </span>
              </div>

              {/* FAVORITES GRID */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((item) => {
                  const itemId = item._id || item.id;

                  const itemQuantity = Number(
                    item.quantity ?? 0
                  );

                  const inStock =
                    item.isAvailable !== false &&
                    itemQuantity > 0;

                  return (
                    <article
                      key={itemId}
                      onClick={() =>
                        navigate(
                          `/product/${itemId}`
                        )
                      }
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition-all duration-300 active:scale-[0.985] sm:rounded-3xl sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-[1/0.85] overflow-hidden bg-slate-100">
                        <img
                          src={
                            item.imageUrl ||
                            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
                          }
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-105"
                        />

                        {/* FAVORITE BADGE */}
                        <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-sm shadow-md backdrop-blur sm:left-3 sm:top-3 sm:h-9 sm:w-9 sm:text-base">
                          ❤️
                        </div>

                        {/* STOCK */}
                        <div
                          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[8px] font-bold shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px] ${
                            inStock
                              ? "border border-emerald-200 bg-emerald-50/95 text-emerald-700"
                              : "border border-rose-200 bg-rose-50/95 text-rose-700"
                          }`}
                        >
                          {inStock
                            ? `${itemQuantity} left`
                            : "Out of stock"}
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-[11px] font-extrabold text-slate-900 sm:text-sm">
                              {item.name}
                            </h3>

                            <p className="mt-0.5 truncate text-[9px] text-slate-400 sm:text-xs">
                              {item.category || "Other"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-slate-950 px-2 py-1 text-[9px] font-extrabold text-white sm:px-2.5 sm:py-1.5 sm:text-xs">
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* RATING + STOCK */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-amber-400 sm:text-xs">
                              ★
                            </span>

                            <span className="text-[9px] font-bold text-slate-700 sm:text-xs">
                              {Number(
                                item.rating ?? 0
                              ).toFixed(1)}
                            </span>
                          </div>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span className="truncate text-[8px] text-slate-400 sm:text-[10px]">
                            {item.reviewCount ||
                              0}{" "}
                            reviews
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-3 space-y-2 sm:mt-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOrderNow(item);
                            }}
                            disabled={!inStock}
                            className="w-full rounded-xl bg-amber-500 px-3 py-2.5 text-[10px] font-extrabold text-slate-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:py-3 sm:text-xs"
                          >
                            {inStock
                              ? "Order now"
                              : "Out of stock"}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemove(itemId);
                            }}
                            className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-[10px] font-bold text-rose-600 transition-all hover:bg-rose-50 active:scale-[0.98] sm:py-3 sm:text-xs"
                          >
                            Remove from favorites
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Favorites;