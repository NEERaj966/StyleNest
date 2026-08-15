import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AdminProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/v1/foodcards/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            const data = response.data?.data;

            if (!data) {
                throw new Error("Product not found");
            }

            setProduct(data);
            setSelectedImage(0);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to load product"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const productImages = useMemo(() => {
        if (!product) return [];

        const images = [];

        if (Array.isArray(product.images)) {
            product.images.forEach((image) => {
                if (typeof image === "string" && image.trim()) {
                    images.push(image.trim());
                }
            });
        }

        if (
            typeof product.imageUrl === "string" &&
            product.imageUrl.trim()
        ) {
            images.push(product.imageUrl.trim());
        }

        return [...new Set(images)];
    }, [product]);

    useEffect(() => {
        if (
            productImages.length > 0 &&
            selectedImage >= productImages.length
        ) {
            setSelectedImage(0);
        }
    }, [productImages, selectedImage]);

    const nextImage = () => {
        if (productImages.length <= 1) return;

        setSelectedImage((current) =>
            current === productImages.length - 1
                ? 0
                : current + 1
        );
    };

    const previousImage = () => {
        if (productImages.length <= 1) return;

        setSelectedImage((current) =>
            current === 0
                ? productImages.length - 1
                : current - 1
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f7f5]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="h-10 w-36 animate-pulse rounded-xl bg-[#f8f4ec]" />

                    <div className="mt-8 grid gap-7 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="h-[420px] animate-pulse rounded-[2rem] bg-[#f8f4ec] sm:h-[600px]" />

                        <div className="space-y-4">
                            <div className="h-5 w-32 animate-pulse rounded bg-[#f8f4ec]" />
                            <div className="h-14 w-4/5 animate-pulse rounded bg-[#f8f4ec]" />
                            <div className="h-28 animate-pulse rounded-xl bg-[#f8f4ec]" />
                            <div className="h-36 animate-pulse rounded-xl bg-[#f8f4ec]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-[#f8f4ec] p-8 text-center shadow-[0_14px_36px_rgba(36,33,29,0.07)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-500">
                        !
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-[#24211d]">
                        Product unavailable
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#746b61]">
                        {error || "We could not find this product."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-6 rounded-xl bg-[#24211d] px-6 py-3 text-xs font-bold text-[#f8f4ec] transition hover:bg-[#302b26]"
                    >
                        ← Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const quantity = Number(product.quantity || 0);

    const isOutOfStock =
        product.isAvailable === false || quantity <= 0;

    const rating = Number(product.rating || 0);
    const reviewCount = Number(product.reviewCount || 0);

    const stockText = isOutOfStock
        ? "Out of Stock"
        : quantity <= 5
        ? "Low Stock"
        : "In Stock";

    const stockClass = isOutOfStock
        ? "border-red-200 bg-red-50 text-red-600"
        : quantity <= 5
        ? "border-[#d9b6a8] bg-[#f2e4dc] text-[#8f3d25]"
        : "border-emerald-200 bg-emerald-50 text-emerald-600";

    return (
        <div className="min-h-screen bg-[#f7f7f5] text-[#24211d]">
            <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#f8f4ec]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-3"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5cec2] bg-[#f8f4ec] text-lg transition group-hover:border-slate-950 group-hover:bg-[#24211d] group-hover:text-[#f8f4ec]">
                            ←
                        </span>

                        <div className="hidden text-left sm:block">
                            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#877d72]">
                                Admin
                            </p>

                            <p className="text-xs font-bold text-[#24211d]">
                                Product Management
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                                Product Details
                            </p>

                            <p className="text-xs font-semibold text-[#3e3730]">
                                Read Only
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24211d] text-sm font-bold text-[#f8f4ec]">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
                <div className="mb-6 flex items-center gap-2 overflow-hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[#877d72]">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="shrink-0 transition hover:text-[#24211d]"
                    >
                        Products
                    </button>

                    <span>/</span>

                    <span className="truncate text-[#3e3730]">
                        {product.name}
                    </span>
                </div>

                <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-start">
                    <div className="min-w-0">
                        <div className="rounded-[2rem] border border-[#d5cec2] bg-[#f8f4ec] p-3 shadow-[0_18px_55px_rgba(36,33,29,0.08)] sm:p-4 lg:sticky lg:top-24">
                            <div className="grid gap-3 lg:grid-cols-[84px_minmax(0,1fr)]">
                                {productImages.length > 1 && (
                                    <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[620px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-1">
                                        {productImages.map((image, index) => (
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedImage(index)
                                                }
                                                aria-label={`View image ${
                                                    index + 1
                                                }`}
                                                className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#e5ded3] transition sm:h-24 sm:w-24 lg:h-20 lg:w-20 ${
                                                    selectedImage === index
                                                        ? "border-slate-950 shadow-[0_6px_18px_rgba(36,33,29,0.08)]"
                                                        : "border-transparent opacity-65 hover:border-[#c9c0b4] hover:opacity-100"
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt=""
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />

                                                {selectedImage === index && (
                                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#24211d]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="order-1 min-w-0 lg:order-2">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#e9e7e1] sm:aspect-[5/6] lg:min-h-[620px]">
                                    {productImages.length > 0 ? (
                                        <img
                                            key={productImages[selectedImage]}
                                            src={productImages[selectedImage]}
                                            alt={product.name || "Product"}
                                            className="h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.025]"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-[420px] flex-col items-center justify-center">
                                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[#f8f4ec] text-4xl shadow-[0_14px_36px_rgba(36,33,29,0.07)]">
                                                📦
                                            </div>

                                            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.3em] text-[#746b61]">
                                                No Image Available
                                            </p>
                                        </div>
                                    )}

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

                                    <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                                        <span className="rounded-full border border-white/20 bg-[#24211d]/45 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#f8f4ec] shadow-[0_10px_28px_rgba(36,33,29,0.06)] backdrop-blur-xl">
                                            {product.category || "Product"}
                                        </span>

                                        <span className="rounded-full border border-white/30 bg-[#f8f4ec]/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#24211d] shadow-[0_10px_28px_rgba(36,33,29,0.06)] backdrop-blur-xl">
                                            Admin Preview
                                        </span>
                                    </div>

                                    {productImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={previousImage}
                                                aria-label="Previous image"
                                                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#24211d]/40 text-xl text-[#f8f4ec] shadow-[0_14px_36px_rgba(36,33,29,0.07)] backdrop-blur-md transition hover:scale-105 hover:bg-[#24211d]/60 sm:left-6 sm:h-12 sm:w-12"
                                            >
                                                ‹
                                            </button>

                                            <button
                                                type="button"
                                                onClick={nextImage}
                                                aria-label="Next image"
                                                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#24211d]/40 text-xl text-[#f8f4ec] shadow-[0_14px_36px_rgba(36,33,29,0.07)] backdrop-blur-md transition hover:scale-105 hover:bg-[#24211d]/60 sm:right-6 sm:h-12 sm:w-12"
                                            >
                                                ›
                                            </button>

                                            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/20 bg-[#24211d]/45 px-3 py-2 backdrop-blur-xl">
                                                {productImages.map(
                                                    (_, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            aria-label={`View image ${
                                                                index + 1
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedImage(
                                                                    index
                                                                )
                                                            }
                                                            className={`h-1.5 rounded-full transition-all ${
                                                                selectedImage ===
                                                                index
                                                                    ? "w-7 bg-[#f8f4ec]"
                                                                    : "w-1.5 bg-[#f8f4ec]/50"
                                                            }`}
                                                        />
                                                    )
                                                )}
                                            </div>

                                            <div className="absolute bottom-5 right-5 rounded-full border border-white/20 bg-[#24211d]/50 px-3 py-2 backdrop-blur-xl">
                                                <span className="text-[9px] font-bold tracking-[0.15em] text-[#f8f4ec]">
                                                    {selectedImage + 1} /{" "}
                                                    {productImages.length}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 rounded-[2rem] border border-black/[0.06] bg-[#f8f4ec] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-7 lg:p-8">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#984126]">
                                {product.category || "Collection"}
                            </span>

                            <span
                                className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${stockClass}`}
                            >
                                {stockText}
                            </span>
                        </div>

                        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#24211d] sm:text-[2.65rem]">
                            {product.name}
                        </h1>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl bg-[#f7f7f5] px-3.5 py-2">
                                <span className="text-[#a94b2e]">★</span>

                                <span className="text-xs font-bold text-[#24211d]">
                                    {rating.toFixed(1)}
                                </span>
                            </div>

                            <span className="text-[10px] text-[#877d72]">
                                {reviewCount} customer reviews
                            </span>
                        </div>

                        <div className="my-7 h-px bg-[#e5ded3]" />

                        {Array.isArray(product.sizes) &&
                            product.sizes.length > 0 && (
                                <div className="mt-7">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                                        Sizes
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {product.sizes.map((size) => (
                                            <span
                                                key={size}
                                                className="rounded-xl border border-[#d5cec2] bg-[#f7f7f5] px-3 py-2 text-xs font-bold text-[#3e3730]"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        <div className="mt-7 rounded-xl bg-[#f7f7f5] p-5">
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                                Selling Price
                            </p>

                            <div className="mt-1 flex items-end gap-2">
                                <span className="text-4xl font-bold tracking-tight text-[#24211d]">
                                    ₹
                                    {Number(
                                        product.price || 0
                                    ).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-xl bg-[#24211d] text-[#f8f4ec]">
                            <div className="border-b border-white/10 px-5 py-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400">
                                            Inventory
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">
                                            Stock Overview
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                            isOutOfStock
                                                ? "bg-red-500/10 text-red-400"
                                                : "bg-emerald-500/10 text-emerald-400"
                                        }`}
                                    >
                                        {isOutOfStock ? "!" : "✓"}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2">
                                <div className="border-r border-white/10 p-5">
                                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#746b61]">
                                        Available Stock
                                    </p>

                                    <p className="mt-2 text-3xl font-bold">
                                        {quantity}
                                    </p>

                                    <p className="mt-1 text-[9px] text-[#746b61]">
                                        units
                                    </p>
                                </div>

                                <div className="p-5">
                                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#746b61]">
                                        Availability
                                    </p>

                                    <p
                                        className={`mt-3 text-sm font-bold ${
                                            isOutOfStock
                                                ? "text-red-400"
                                                : "text-emerald-400"
                                        }`}
                                    >
                                        {isOutOfStock
                                            ? "Unavailable"
                                            : "Available"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#e0d8cd] bg-[#eee8de] p-4">
                                <p className="text-[8px] font-bold uppercase tracking-wider text-[#877d72]">
                                    Rating
                                </p>

                                <p className="mt-2 text-xl font-bold">
                                    {rating.toFixed(1)}
                                    <span className="ml-1 text-[#a94b2e]">
                                        ★
                                    </span>
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e0d8cd] bg-[#eee8de] p-4">
                                <p className="text-[8px] font-bold uppercase tracking-wider text-[#877d72]">
                                    Reviews
                                </p>

                                <p className="mt-2 text-xl font-bold">
                                    {reviewCount}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-amber-100 bg-[#f2e4dc] p-4">
                            <div className="flex gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f4ec] text-sm">
                                    👁
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-[#302b26]">
                                        Read-only product view
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-[#746b61]">
                                        This page is for product inspection
                                        and inventory monitoring.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-7 rounded-[2rem] border border-black/[0.06] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-8">
                    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#984126]">
                                Product Copy
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Description
                            </h2>
                        </div>

                        <p className="text-sm leading-7 text-[#746b61] sm:text-base sm:leading-8">
                            {product.description ||
                                "No product description has been added."}
                        </p>
                    </div>
                </section>

                <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-black/[0.06] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#24211d] text-[#f8f4ec]">
                            ✦
                        </div>

                        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                            Category
                        </p>

                        <p className="mt-2 text-lg font-bold">
                            {product.category || "Uncategorized"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-black/[0.06] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2e4dc] text-[#984126]">
                            ₹
                        </div>

                        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                            Price
                        </p>

                        <p className="mt-2 text-lg font-bold">
                            ₹
                            {Number(product.price || 0).toLocaleString(
                                "en-IN"
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border border-black/[0.06] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:col-span-2 lg:col-span-1">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            ✓
                        </div>

                        <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#877d72]">
                            Status
                        </p>

                        <p className="mt-2 text-lg font-bold">
                            {stockText}
                        </p>
                    </div>
                </section>

                <section className="mt-7 rounded-[2rem] border border-black/[0.06] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-8">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#984126]">
                                Customer Feedback
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Customer Reviews
                            </h2>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-3xl font-bold">
                                {rating.toFixed(1)}
                            </p>

                            <p className="text-sm tracking-widest text-[#a94b2e]">
                                ★★★★★
                            </p>
                        </div>
                    </div>

                    {Array.isArray(product.reviews) &&
                    product.reviews.length > 0 ? (
                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            {product.reviews.map((review, index) => (
                                <article
                                    key={review._id || index}
                                    className="rounded-xl border border-[#e0d8cd] bg-[#faf9f6] p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#24211d] text-xs font-bold text-[#f8f4ec]">
                                                {(
                                                    review.name || "C"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold">
                                                    {review.name || "Customer"}
                                                </p>

                                                <p className="mt-1 text-xs text-[#a94b2e]">
                                                    {"★".repeat(
                                                        Math.min(
                                                            5,
                                                            Number(
                                                                review.rating ||
                                                                    0
                                                            )
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {review.createdAt && (
                                            <span className="shrink-0 text-[8px] text-[#877d72]">
                                                {new Date(
                                                    review.createdAt
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {review.comment && (
                                        <p className="mt-5 text-xs leading-6 text-[#746b61]">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-7 rounded-xl border border-dashed border-[#d5cec2] bg-[#faf9f6] p-12 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f4ec] text-2xl shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                                ★
                            </div>

                            <h3 className="mt-4 text-sm font-bold">
                                No customer reviews
                            </h3>

                            <p className="mt-2 text-xs text-[#877d72]">
                                Reviews will appear here when customers
                                submit them.
                            </p>
                        </div>
                    )}
                </section>

                <div className="flex justify-center py-9">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-full border border-[#d5cec2] bg-[#f8f4ec] px-7 py-3 text-[9px] font-bold uppercase tracking-[0.25em] text-[#746b61] transition hover:border-slate-950 hover:text-[#24211d]"
                    >
                        ← Back to Products
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AdminProductDetail;
