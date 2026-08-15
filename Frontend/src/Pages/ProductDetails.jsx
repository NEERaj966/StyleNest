import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useThrottle from "../hooks/useThrottle";



const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // =========================================================
    // PRODUCT
    // =========================================================

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    const [selectedImage, setSelectedImage] = useState(0);

    // =========================================================
    // QUANTITY
    // =========================================================

    const [quantity, setQuantity] = useState(1);

    // =========================================================
    // WISHLIST
    // =========================================================

    const [isFavorite, setIsFavorite] = useState(false);

    // =========================================================
    // CART / BUY NOW
    // =========================================================

    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    // =========================================================
    // ADDRESS
    // =========================================================

    const [address, setAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);

    // =========================================================
    // REVIEWS
    // =========================================================

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    // =========================================================
    // IMAGE ARRAY
    // =========================================================

    const productImages = useMemo(() => {
        if (!product) return [];

        const images = [];

        // New multiple image system
        if (Array.isArray(product.images)) {
            product.images.forEach((image) => {
                if (image) {
                    images.push(image);
                }
            });
        }

        // Backward compatibility with old products
        if (
            product.imageUrl &&
            !images.includes(product.imageUrl)
        ) {
            images.unshift(product.imageUrl);
        }

        return [...new Set(images)];
    }, [product]);

    // =========================================================
    // FETCH PRODUCT
    // =========================================================

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
                {
                    withCredentials: true,
                }
            );


            const productData = res.data?.data || null;

            if (!productData) {
                throw new Error("Product not found");
            }

            setProduct(productData);
            setSelectedImage(0);

        } catch (error) {
            console.error(
                "Failed to fetch product:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load product."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH ADDRESS
    // =========================================================

    const fetchAddress = async () => {
        try {
            setAddressLoading(true);

            const token = localStorage.getItem("token");

            // User is not logged in
            if (!token) {
                console.log("No authentication token found.");
                setAddress(null);
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/v1/addressesDetail/default`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );


            const addressData =
                response.data?.data?.address ||
                response.data?.data ||
                null;

            setAddress(addressData);

        } catch (error) {
            const status = error?.response?.status;

            console.error("Failed to fetch address:", {
                status,
                message: error?.response?.data?.message || error.message,
                url: error?.config?.url,
            });

            // Token is missing/invalid/expired
            if (status === 401) {
                console.log("User authentication failed.");

                setAddress(null);

                // Optional:
                // localStorage.removeItem("token");

                return;
            }

            // Address doesn't exist
            if (status === 404) {
                console.log("No default address found.");
                setAddress(null);
                return;
            }

            // Other server/network errors
            setAddress(null);

        } finally {
            setAddressLoading(false);
        }
    };
    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (!id) return;

        fetchProduct();
        fetchAddress();
    }, [id]);

    // =========================================================
    // STOCK
    // =========================================================

    const stockStatus = useMemo(() => {
        if (!product) {
            return {
                text: "Checking stock...",
                className:
                    "bg-[#e5ded3] text-[#746b61] border-[#d5cec2]",
            };
        }

        const stockQuantity =
            Number(product.quantity || 0);

        if (
            product.isAvailable === false ||
            stockQuantity === 0
        ) {
            return {
                text: "Out of stock",
                className:
                    "bg-red-50 text-red-600 border-red-100",
            };
        }

        if (stockQuantity <= 10) {
            return {
                text: `Only ${stockQuantity} left`,
                className:
                    "bg-[#f2e4dc] text-[#984126] border-amber-100",
            };
        }

        return {
            text: "In stock",
            className:
                "bg-emerald-50 text-emerald-600 border-emerald-100",
        };
    }, [product]);

    const isOutOfStock =
        !product ||
        product.isAvailable === false ||
        Number(product.quantity || 0) === 0;

    // =========================================================
    // IMAGE NAVIGATION
    // =========================================================

    const goToNextImage = () => {
        if (productImages.length <= 1) return;

        setSelectedImage((current) =>
            current === productImages.length - 1
                ? 0
                : current + 1
        );
    };

    const goToPreviousImage = () => {
        if (productImages.length <= 1) return;

        setSelectedImage((current) =>
            current === 0
                ? productImages.length - 1
                : current - 1
        );
    };

    // =========================================================
    // QUANTITY
    // =========================================================

    const increaseQuantity = () => {
        if (!product) return;

        const maxQuantity =
            Number(product.quantity || 0);

        setQuantity((current) =>
            Math.min(current + 1, maxQuantity)
        );
    };

    const decreaseQuantity = () => {
        setQuantity((current) =>
            Math.max(current - 1, 1)
        );
    };

    // =========================================================
    // FAVORITE
    // =========================================================

    const handleFavorite = async () => {
        try {
            /*
             * Connect your wishlist API here.
             */

            setIsFavorite((current) => !current);

        } catch (error) {
            console.error(
                "Wishlist error:",
                error
            );
        }
    };

    const throttledFavorite = useThrottle(
    handleFavorite,
    700
);
    // =========================================================
    // ADD TO CART
    // =========================================================

    const handleAddToCart = async () => {
        if (!product || isOutOfStock) return;

        try {
            setAddingToCart(true);

            console.log("Add to cart:", {
                productId: product._id,
                quantity,
            });

            alert(
                `${product.name} added to cart`
            );

        } catch (error) {
            console.error(
                "Add to cart failed:",
                error
            );
        } finally {
            setAddingToCart(false);
        }
    };

    // =========================================================
    // BUY NOW
    // =========================================================

    const handleBuyNow = async () => {
        if (!product || isOutOfStock) return;

        try {
            setBuyingNow(true);

            navigate("/orders", {
                state: {
                    product,
                    quantity,
                    buyNow: true,
                },
            });

        } catch (error) {
            console.error(
                "Buy now failed:",
                error
            );
        } finally {
            setBuyingNow(false);
        }
    };

    const throttledBuyNow = useThrottle(
    handleBuyNow,
    1500
);

    // =========================================================
    // SUBMIT REVIEW
    // =========================================================

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!product) return;

        if (!reviewComment.trim()) {
            return;
        }

        try {
            setSubmittingReview(true);

            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${product._id}/reviews`,
                {
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                },
                {
                    withCredentials: true,
                }
            );

            console.log(
                "Review response:",
                res.data
            );

            setReviewComment("");
            setReviewRating(5);

            await fetchProduct();

        } catch (error) {
            console.error(
                "Failed to submit review:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to submit review"
            );

        } finally {
            setSubmittingReview(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eee8de] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl animate-pulse">

                    <div className="mb-6 h-5 w-40 rounded bg-[#d9d0c4]" />

                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

                        <div className="h-[550px] rounded-[2rem] bg-[#d9d0c4]" />

                        <div className="space-y-5">
                            <div className="h-6 w-24 rounded bg-[#d9d0c4]" />

                            <div className="h-10 w-3/4 rounded bg-[#d9d0c4]" />

                            <div className="h-20 w-full rounded bg-[#d9d0c4]" />

                            <div className="h-10 w-32 rounded bg-[#d9d0c4]" />

                            <div className="h-14 w-full rounded-xl bg-[#d9d0c4]" />
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error || !product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#eee8de] px-4">

                <div className="w-full max-w-md rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-8 text-center shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 text-2xl">
                        ⚠️
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#24211d]">
                        Product not found
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#877d72]">
                        {error ||
                            "The product you're looking for is no longer available."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-6 rounded-xl bg-[#24211d] px-5 py-3 text-sm font-semibold text-[#f8f4ec] transition hover:bg-[#302b26]"
                    >
                        Go Back
                    </button>

                </div>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="min-h-screen bg-[#eee8de] px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    BREADCRUMB
                ================================================= */}

                <div className="mb-6 flex items-center gap-2 text-xs text-[#877d72]">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="font-medium transition hover:text-[#3e3730]"
                    >
                        Products
                    </button>

                    <span>›</span>

                    <span className="text-[#5d554c]">
                        {product.name}
                    </span>

                </div>

                {/* =================================================
                    PRODUCT
                ================================================= */}

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

                    {/* =================================================
                        IMAGE GALLERY
                    ================================================= */}

                    <div className="rounded-[2rem] border border-[#d5cec2] bg-[#f8f4ec] p-3 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-4">

                        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#e5ded3]">

                            <div className="relative flex min-h-[430px] items-center justify-center sm:min-h-[560px]">

                                {productImages.length > 0 ? (
                                    <img
                                        src={
                                            productImages[
                                            selectedImage
                                            ]
                                        }
                                        alt={product.name}
                                        className="
                                            h-full
                                            max-h-[560px]
                                            w-full
                                            object-cover
                                            transition-all
                                            duration-500
                                        "
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-[#9b9186]">
                                        <span className="text-7xl">
                                            📦
                                        </span>

                                        <span className="mt-3 text-xs font-medium">
                                            No product image
                                        </span>
                                    </div>
                                )}

                                {/* CATEGORY */}

                                <span className="absolute left-5 top-5 rounded-full bg-[#f8f4ec]/95 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#3e3730] shadow-[0_3px_12px_rgba(36,33,29,0.04)] backdrop-blur">
                                    {product.category}
                                </span>

                                {/* IMAGE COUNT */}

                                {productImages.length > 1 && (
                                    <span className="absolute bottom-5 left-5 rounded-full bg-[#24211d]/60 px-3 py-1.5 text-[10px] font-semibold text-[#f8f4ec] backdrop-blur">
                                        {selectedImage + 1} /{" "}
                                        {productImages.length}
                                    </span>
                                )}

                                {/* FAVORITE */}

                                <button
                                    type="button"
                                    onClick={handleFavorite}
                                    className="
                                        absolute
                                        right-5
                                        top-5
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#f8f4ec]/95
                                        text-lg
                                        shadow-[0_10px_28px_rgba(36,33,29,0.06)]
                                        backdrop-blur
                                        transition
                                        hover:scale-105
                                    "
                                    aria-label="Add to wishlist"
                                >
                                    {isFavorite
                                        ? "❤️"
                                        : "🤍"}
                                </button>

                                {/* PREVIOUS */}

                                {productImages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={
                                            goToPreviousImage
                                        }
                                        className="
                                            absolute
                                            left-4
                                            top-1/2
                                            flex
                                            h-11
                                            w-11
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#f8f4ec]/90
                                            text-xl
                                            text-[#3e3730]
                                            shadow-[0_10px_28px_rgba(36,33,29,0.06)]
                                            backdrop-blur
                                            transition
                                            hover:scale-105
                                        "
                                        aria-label="Previous image"
                                    >
                                        ‹
                                    </button>
                                )}

                                {/* NEXT */}

                                {productImages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={
                                            goToNextImage
                                        }
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            flex
                                            h-11
                                            w-11
                                            translate-y-[-50%]
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#f8f4ec]/90
                                            text-xl
                                            text-[#3e3730]
                                            shadow-[0_10px_28px_rgba(36,33,29,0.06)]
                                            backdrop-blur
                                            transition
                                            hover:scale-105
                                        "
                                        aria-label="Next image"
                                    >
                                        ›
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* THUMBNAILS */}

                        {productImages.length > 1 && (
                            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">

                                {productImages.map(
                                    (image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImage(
                                                    index
                                                )
                                            }
                                            className={`
                                                relative
                                                aspect-square
                                                overflow-hidden
                                                rounded-xl
                                                border-2
                                                bg-[#e5ded3]
                                                transition
                                                ${selectedImage ===
                                                    index
                                                    ? "border-amber-500 ring-4 ring-amber-100"
                                                    : "border-transparent hover:border-[#c9c0b4]"
                                                }
                                            `}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index +
                                                    1
                                                    }`}
                                                className="h-full w-full object-cover"
                                            />

                                            {selectedImage ===
                                                index && (
                                                    <div className="absolute inset-0 bg-[#24211d]/10" />
                                                )}
                                        </button>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                    {/* =================================================
                        PRODUCT INFORMATION
                    ================================================= */}

                    <div className="flex flex-col rounded-[2rem] border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-8">

                        {/* CATEGORY + STOCK */}

                        <div className="flex items-center justify-between gap-3">

                            <span className="rounded-full bg-[#f2e4dc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#984126]">
                                {product.category}
                            </span>

                            <span
                                className={`
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-semibold
                                    ${stockStatus.className}
                                `}
                            >
                                {stockStatus.text}
                            </span>

                        </div>

                        {/* NAME */}

                        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#24211d] sm:text-4xl">
                            {product.name}
                        </h1>

                        {/* RATING */}

                        <div className="mt-4 flex flex-wrap items-center gap-3">

                            <div className="flex items-center gap-1 rounded-full bg-[#f2e4dc] px-3 py-1.5">

                                <span className="text-amber-400">
                                    ★
                                </span>

                                <span className="text-xs font-bold text-[#3e3730]">
                                    {Number(
                                        product.rating || 0
                                    ).toFixed(1)}
                                </span>

                            </div>

                            <span className="text-xs text-[#877d72]">
                                {product.reviewCount || 0}{" "}
                                customer reviews
                            </span>

                        </div>

                        {/* DESCRIPTION */}

                        <div className="mt-7">

                            <p className="text-xs font-bold uppercase tracking-wider text-[#877d72]">
                                Description
                            </p>

                            <p className="mt-3 text-sm leading-7 text-[#746b61]">
                                {product.description ||
                                    "This product does not have a description yet."}
                            </p>

                        </div>

                        {/* PRICE */}

                        <div className="mt-7 border-y border-[#e0d8cd] py-6">

                            <p className="text-xs font-medium text-[#877d72]">
                                Price
                            </p>

                            <div className="mt-1 flex items-end gap-2">

                                <span className="text-3xl font-bold text-[#24211d]">
                                    ₹
                                    {Number(
                                        product.price || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                                <span className="pb-1 text-xs text-[#877d72]">
                                    Inclusive of all taxes
                                </span>

                            </div>

                        </div>

                        {/* QUANTITY */}

                        {!isOutOfStock && (
                            <div className="mt-6">

                                <p className="text-xs font-bold text-[#3e3730]">
                                    Quantity
                                </p>

                                <div className="mt-3 flex w-fit items-center overflow-hidden rounded-xl border border-[#d5cec2]">

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <=
                                            1
                                        }
                                        className="flex h-11 w-11 items-center justify-center text-lg text-[#746b61] transition hover:bg-[#eee8de] disabled:opacity-30"
                                    >
                                        −
                                    </button>

                                    <span className="flex h-11 w-12 items-center justify-center border-x border-[#d5cec2] text-sm font-bold text-[#302b26]">
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        disabled={
                                            quantity >=
                                            Number(
                                                product.quantity ||
                                                0
                                            )
                                        }
                                        className="flex h-11 w-11 items-center justify-center text-lg text-[#746b61] transition hover:bg-[#eee8de] disabled:opacity-30"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                     ACTIONS
 ================================================= */}

                        <div className="mt-7">

                            {/* ORDER SUMMARY */}
                            <div
                                className="
            mb-4
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-[#e0d8cd]
            bg-[#eee8de]
            px-4
            py-3
        "
                            >
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#877d72]">
                                        Your Order
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-[#3e3730]">
                                        {quantity} × {product.name}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] text-[#877d72]">
                                        Total
                                    </p>

                                    <p className="text-base font-bold text-[#24211d]">
                                        ₹
                                        {(
                                            Number(product.price || 0) * quantity
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            {/* MAIN ACTION BUTTONS */}
                            <div
                                className="
            grid
            gap-3
            sm:grid-cols-2
        "
                            >

                                {/* ADD TO CART */}
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || addingToCart}
                                    className="
                group
                relative
                flex
                h-14
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-xl
                border
                border-[#d9b6a8]
                bg-[#f2e4dc]
                px-5
                text-sm
                font-bold
                text-[#8f3d25]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-[#c99a89]
                hover:bg-[#ead6cc]
                hover:shadow-[0_10px_28px_rgba(36,33,29,0.06)]
                hover:shadow-amber-100
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
                                >
                                    {/* Icon */}
                                    <span
                                        className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#f8f4ec]
                    text-lg
                    shadow-[0_3px_12px_rgba(36,33,29,0.04)]
                    transition-transform
                    duration-200
                    group-hover:scale-110
                "
                                    >
                                        {addingToCart ? (
                                            <span
                                                className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-[#d9b6a8]
                            border-t-amber-700
                        "
                                            />
                                        ) : (
                                            "🛒"
                                        )}
                                    </span>

                                    <span className="flex flex-col items-start">
                                        <span className="text-sm">
                                            {addingToCart
                                                ? "Adding..."
                                                : "Add to Cart"}
                                        </span>

                                        {!addingToCart && (
                                            <span className="text-[9px] font-medium text-[#a94b2e]">
                                                Save for later
                                            </span>
                                        )}
                                    </span>
                                </button>

                                {/* BUY NOW */}
                                <button
                                    type="button"
                                    onClick={throttledBuyNow}
                                    disabled={isOutOfStock || buyingNow}
                                    className="
                group
                relative
                flex
                h-14
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-xl
                bg-[#24211d]
                px-5
                text-sm
                font-bold
                text-[#f8f4ec]
                shadow-[0_10px_28px_rgba(36,33,29,0.06)]
                shadow-slate-200
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#302b26]
                hover:shadow-[0_14px_36px_rgba(36,33,29,0.07)]
                hover:shadow-slate-300
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
                                >
                                    {/* Shine effect */}
                                    <span
                                        className="
                    pointer-events-none
                    absolute
                    inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/10
                    to-transparent
                    transition-transform
                    duration-700
                    group-hover:translate-x-full
                "
                                    />

                                    <span
                                        className="
                    relative
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#f8f4ec]/10
                    text-lg
                    backdrop-blur
                    transition-transform
                    duration-200
                    group-hover:scale-110
                "
                                    >
                                        {buyingNow ? (
                                            <span
                                                className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-slate-500
                            border-t-white
                        "
                                            />
                                        ) : (
                                            "⚡"
                                        )}
                                    </span>

                                    <span className="relative flex flex-col items-start">
                                        <span className="text-sm">
                                            {buyingNow
                                                ? "Processing..."
                                                : "Buy Now"}
                                        </span>

                                        {!buyingNow && (
                                            <span className="text-[9px] font-medium text-[#877d72]">
                                                Fast checkout
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </div>

                            {/* WISHLIST */}
                            <button
                                type="button"
                                onClick={throttledFavorite}
                                className="
            mt-3
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[#d5cec2]
            bg-[#f8f4ec]
            text-xs
            font-semibold
            text-[#5d554c]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-[#c9c0b4]
            hover:bg-[#eee8de]
            hover:shadow-[0_3px_12px_rgba(36,33,29,0.04)]
        "
                            >
                                <span className="text-base">
                                    {isFavorite ? "❤️" : "♡"}
                                </span>

                                {isFavorite
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"}
                            </button>

                            {/* TRUST MESSAGE */}
                            {!isOutOfStock && (
                                <div
                                    className="
                mt-4
                flex
                items-center
                justify-center
                gap-2
                text-[10px]
                font-medium
                text-[#877d72]
            "
                                >
                                    <span className="text-emerald-500">
                                        ✓
                                    </span>

                                    Secure checkout

                                    <span className="text-slate-200">
                                        •
                                    </span>

                                    Easy returns

                                    <span className="text-slate-200">
                                        •
                                    </span>

                                    Fast delivery
                                </div>
                            )}
                        </div>

                        {/* BENEFITS */}

                        <div className="mt-7 grid grid-cols-3 gap-3">

                            <div className="rounded-xl bg-[#eee8de] p-4 text-center">
                                <span className="text-lg">
                                    🚚
                                </span>

                                <p className="mt-2 text-[10px] font-bold text-[#3e3730]">
                                    Fast Delivery
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#eee8de] p-4 text-center">
                                <span className="text-lg">
                                    🔒
                                </span>

                                <p className="mt-2 text-[10px] font-bold text-[#3e3730]">
                                    Secure Payment
                                </p>
                            </div>

                            <div className="rounded-xl bg-[#eee8de] p-4 text-center">
                                <span className="text-lg">
                                    ↩️
                                </span>

                                <p className="mt-2 text-[10px] font-bold text-[#3e3730]">
                                    Easy Returns
                                </p>
                            </div>

                        </div>

                    </div>
                </div>



                {/* =================================================
                            DELIVERY ADDRESS
                ================================================= */}

                <section className="mt-8 rounded-[2rem] border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📍</span>

                                <h2 className="text-base font-bold text-[#24211d]">
                                    Delivery Address
                                </h2>
                            </div>

                            <p className="mt-1 text-xs text-[#877d72]">
                                Choose where you want your order delivered
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/addresses")}
                            className="rounded-xl border border-[#d5cec2] px-4 py-2.5 text-xs font-bold text-[#3e3730] transition hover:bg-[#eee8de]"
                        >
                            {address ? "Change Address" : "Add Address"}
                        </button>

                    </div>

                    <div className="mt-5">

                        {addressLoading ? (

                            <div className="animate-pulse rounded-xl bg-[#eee8de] p-5">

                                <div className="h-4 w-32 rounded bg-[#d9d0c4]" />

                                <div className="mt-3 h-3 w-full rounded bg-[#d9d0c4]" />

                                <div className="mt-2 h-3 w-2/3 rounded bg-[#d9d0c4]" />

                            </div>

                        ) : address ? (

                            <div className="rounded-xl border border-amber-100 bg-[#f2e4dc]/50 p-5">

                                <div className="flex items-start justify-between gap-4">

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <p className="text-sm font-bold text-[#24211d]">
                                                {address.name}
                                            </p>

                                            {address.type && (
                                                <span className="rounded-full bg-[#f8f4ec] px-2 py-1 text-[9px] font-bold uppercase text-[#984126]">
                                                    {address.type}
                                                </span>
                                            )}

                                            {address.isDefault && (
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase text-emerald-600">
                                                    Default
                                                </span>
                                            )}

                                        </div>

                                        <p className="mt-2 text-xs leading-6 text-[#746b61]">

                                            {address.addressLine1}

                                            {address.addressLine2 && (
                                                <>
                                                    , {address.addressLine2}
                                                </>
                                            )}

                                            {address.city && (
                                                <>
                                                    , {address.city}
                                                </>
                                            )}

                                            {address.state && (
                                                <>
                                                    , {address.state}
                                                </>
                                            )}

                                            {address.pincode && (
                                                <>
                                                    {" "} - {address.pincode}
                                                </>
                                            )}

                                        </p>

                                        {address.landmark && (
                                            <p className="mt-1 text-xs text-[#877d72]">
                                                Landmark: {address.landmark}
                                            </p>
                                        )}

                                        {address.phone && (
                                            <p className="mt-2 text-xs font-medium text-[#5d554c]">
                                                📞 {address.phone}
                                            </p>
                                        )}

                                    </div>

                                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600">
                                        ✓ Selected
                                    </span>

                                </div>

                            </div>

                        ) : (

                            <div className="rounded-xl border border-dashed border-[#c9c0b4] bg-[#eee8de] p-7 text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f4ec] text-xl shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                                    📍
                                </div>

                                <h3 className="mt-3 text-sm font-bold text-[#302b26]">
                                    Add a delivery address
                                </h3>

                                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#877d72]">
                                    Add your address to check delivery options for this product.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => navigate("/addresses/neeraj")}
                                    className="mt-4 rounded-xl bg-[#24211d] px-4 py-2.5 text-xs font-bold text-[#f8f4ec] transition hover:bg-[#302b26]"
                                >
                                    Add Address
                                </button>

                            </div>

                        )}

                    </div>

                </section>

                {/* =================================================
                    REVIEWS
                ================================================= */}

                <section className="mt-8 rounded-[2rem] border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-8">

                    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

                        {/* RATING SUMMARY */}

                        <div>

                            <p className="text-xs font-bold uppercase tracking-wider text-[#877d72]">
                                Customer Reviews
                            </p>

                            <div className="mt-5 rounded-xl bg-[#eee8de] p-6">

                                <p className="text-4xl font-bold text-[#24211d]">
                                    {Number(
                                        product.rating ||
                                        0
                                    ).toFixed(1)}
                                </p>

                                <div className="mt-2 flex gap-1">

                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                            <span
                                                key={
                                                    star
                                                }
                                                className={
                                                    star <=
                                                        Math.round(
                                                            Number(
                                                                product.rating ||
                                                                0
                                                            )
                                                        )
                                                        ? "text-amber-400"
                                                        : "text-slate-200"
                                                }
                                            >
                                                ★
                                            </span>
                                        )
                                    )}

                                </div>

                                <p className="mt-2 text-xs text-[#877d72]">
                                    Based on{" "}
                                    {product.reviewCount ||
                                        0}{" "}
                                    reviews
                                </p>

                            </div>

                        </div>

                        {/* REVIEWS */}

                        <div>

                            {product.reviews?.length >
                                0 ? (

                                <div className="space-y-5">

                                    {product.reviews.map(
                                        (
                                            review,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    review._id ||
                                                    index
                                                }
                                                className="rounded-xl border border-[#e0d8cd] p-5"
                                            >

                                                <div className="flex items-start justify-between gap-4">

                                                    <div>

                                                        <p className="text-sm font-bold text-[#302b26]">
                                                            {review.name ||
                                                                "Customer"}
                                                        </p>

                                                        <div className="mt-1 flex gap-0.5">

                                                            {[1, 2, 3, 4, 5].map(
                                                                (
                                                                    star
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            star
                                                                        }
                                                                        className={
                                                                            star <=
                                                                                review.rating
                                                                                ? "text-amber-400"
                                                                                : "text-slate-200"
                                                                        }
                                                                    >
                                                                        ★
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    </div>

                                                    {review.createdAt && (
                                                        <span className="text-[10px] text-[#877d72]">
                                                            {new Date(
                                                                review.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN",
                                                                {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </span>
                                                    )}

                                                </div>

                                                {review.comment && (
                                                    <p className="mt-4 text-xs leading-6 text-[#746b61]">
                                                        {
                                                            review.comment
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="rounded-xl border border-dashed border-[#d5cec2] p-8 text-center">

                                    <span className="text-3xl">
                                        ⭐
                                    </span>

                                    <p className="mt-3 text-sm font-bold text-[#3e3730]">
                                        No reviews yet
                                    </p>

                                    <p className="mt-1 text-xs text-[#877d72]">
                                        Be the first person to review this product.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* WRITE REVIEW */}

                    <div className="mt-8 border-t border-[#e0d8cd] pt-8">

                        <h3 className="text-sm font-bold text-[#24211d]">
                            Write a Review
                        </h3>

                        <form
                            onSubmit={
                                handleSubmitReview
                            }
                            className="mt-5"
                        >

                            <div>

                                <p className="text-xs font-semibold text-[#5d554c]">
                                    Your Rating
                                </p>

                                <div className="mt-2 flex gap-1">

                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (

                                            <button
                                                key={
                                                    star
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setReviewRating(
                                                        star
                                                    )
                                                }
                                                className="text-2xl transition hover:scale-110"
                                            >
                                                <span
                                                    className={
                                                        star <=
                                                            reviewRating
                                                            ? "text-amber-400"
                                                            : "text-slate-200"
                                                    }
                                                >
                                                    ★
                                                </span>
                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                            <textarea
                                value={
                                    reviewComment
                                }
                                onChange={(e) =>
                                    setReviewComment(
                                        e.target.value
                                    )
                                }
                                rows={4}
                                placeholder="Share your experience with this product..."
                                className="mt-5 w-full resize-none rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3 text-sm text-[#3e3730] outline-none transition placeholder:text-[#877d72] focus:border-amber-400 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-amber-100"
                            />

                            <div className="mt-4 flex justify-end">

                                <button
                                    type="submit"
                                    disabled={
                                        submittingReview ||
                                        !reviewComment.trim()
                                    }
                                    className="rounded-xl bg-[#24211d] px-5 py-3 text-xs font-bold text-[#f8f4ec] transition hover:bg-[#302b26] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submittingReview
                                        ? "Submitting..."
                                        : "Submit Review"}
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

                {/* =================================================
                    BACK
                ================================================= */}

                <div className="mt-8 flex justify-center pb-8">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] px-5 py-3 text-xs font-bold text-[#5d554c] shadow-[0_3px_12px_rgba(36,33,29,0.04)] transition hover:bg-[#eee8de]"
                    >
                        ← Continue Shopping
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ProductDetailPage;