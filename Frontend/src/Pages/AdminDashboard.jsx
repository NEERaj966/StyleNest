import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    const fetchDashboard = useCallback(async (manual = false) => {
        try {
            if (manual) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const [productResponse, orderResponse] =
                await Promise.all([
                    axios.get(
                        `${BASE_URL}/api/v1/foodcards`,
                        config
                    ),

                    axios.get(
                        `${BASE_URL}/api/v1/admin/orders`,
                        config
                    ),
                ]);

            // -------------------------------------------------
            // PRODUCTS
            // -------------------------------------------------

            const productData =
                productResponse?.data?.data;

            const productList =
                productData?.items ||
                productData?.foodcards ||
                productData?.products ||
                (Array.isArray(productData)
                    ? productData
                    : []);

            setProducts(productList);

            // -------------------------------------------------
            // ORDERS
            // -------------------------------------------------

            const orderData =
                orderResponse?.data?.data;

            const orderList =
                orderData?.orders ||
                orderData?.items ||
                (Array.isArray(orderData)
                    ? orderData
                    : []);

            setOrders(orderList);

            setLastUpdated(new Date());

        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

            if (
                error?.response?.status === 401 ||
                error?.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [BASE_URL, navigate]);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchDashboard();

        const interval = setInterval(() => {
            fetchDashboard();
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchDashboard]);

    // =========================================================
    // INVENTORY CALCULATIONS
    // =========================================================

    const inventoryStats = useMemo(() => {
        const totalProducts = products.length;

        const totalUnits = products.reduce(
            (sum, product) =>
                sum + Number(product.quantity || 0),
            0
        );

        const outOfStock = products.filter(
            (product) =>
                Number(product.quantity || 0) <= 0 ||
                product.isAvailable === false
        );

        const lowStock = products.filter(
            (product) => {
                const quantity =
                    Number(product.quantity || 0);

                return (
                    quantity > 0 &&
                    quantity <= 5 &&
                    product.isAvailable !== false
                );
            }
        );

        const healthyStock =
            products.filter(
                (product) =>
                    Number(product.quantity || 0) > 5 &&
                    product.isAvailable !== false
            );

        const health =
            totalProducts > 0
                ? Math.round(
                      (healthyStock.length /
                          totalProducts) *
                          100
                  )
                : 0;

        return {
            totalProducts,
            totalUnits,
            outOfStock,
            lowStock,
            healthyStock,
            health,
        };
    }, [products]);

    // =========================================================
    // ORDER CALCULATIONS
    // =========================================================

    const orderStats = useMemo(() => {
        const placed = orders.filter(
            (order) =>
                order.status === "Placed"
        );

        const preparing = orders.filter(
            (order) =>
                order.status === "Preparing"
        );

        const ready = orders.filter(
            (order) =>
                order.status === "Ready"
        );

        const delivered = orders.filter(
            (order) =>
                order.status === "Delivered"
        );

        const cancelled = orders.filter(
            (order) =>
                order.status === "Cancelled"
        );

        const liveOrders = orders.filter(
            (order) =>
                ![
                    "Delivered",
                    "Cancelled",
                ].includes(order.status)
        );

        const totalRevenue =
            orders
                .filter(
                    (order) =>
                        order.status !==
                        "Cancelled"
                )
                .reduce(
                    (sum, order) =>
                        sum +
                        Number(
                            order.total || 0
                        ),
                    0
                );

        return {
            placed,
            preparing,
            ready,
            delivered,
            cancelled,
            liveOrders,
            totalRevenue,
        };
    }, [orders]);

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "Placed":
                return "bg-blue-50 text-blue-700 border-blue-100";

            case "Preparing":
                return "bg-amber-50 text-amber-700 border-amber-100";

            case "Ready":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";

            case "Delivered":
                return "bg-slate-100 text-slate-600 border-slate-200";

            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-100";

            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // =========================================================
    // DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-8">
                <div className="mx-auto max-w-7xl">

                    <div className="animate-pulse">

                        <div className="h-8 w-56 rounded bg-slate-200" />

                        <div className="mt-3 h-4 w-80 rounded bg-slate-200" />

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-32 rounded-3xl bg-white"
                                    />
                                )
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                                Live Admin Dashboard
                            </p>

                        </div>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Store Overview
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Monitor your inventory and order
                            queue in real time.
                        </p>

                        {lastUpdated && (
                            <p className="mt-2 text-xs text-slate-400">
                                Last updated{" "}
                                {formatDate(lastUpdated)}
                                {" "}• Auto refresh every 15s
                            </p>
                        )}

                    </div>

                    <div className="flex flex-wrap gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                fetchDashboard(true)
                            }
                            disabled={refreshing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/orders")
                            }
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                            View Orders →
                        </button>

                    </div>

                </div>

                {/* ================================================= */}
                {/* MAIN STATS */}
                {/* ================================================= */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* PRODUCTS */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Products
                                </p>

                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {
                                        inventoryStats.totalProducts
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Total products
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                                📦
                            </div>

                        </div>

                    </div>

                    {/* STOCK */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Inventory Units
                                </p>

                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {
                                        inventoryStats.totalUnits
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Units currently available
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                📊
                            </div>

                        </div>

                    </div>

                    {/* LOW STOCK */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Stock Alerts
                                </p>

                                <p className="mt-3 text-3xl font-bold text-amber-600">
                                    {
                                        inventoryStats.lowStock.length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Low stock products
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                                ⚠️
                            </div>

                        </div>

                    </div>

                    {/* LIVE ORDERS */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Live Orders
                                </p>

                                <p className="mt-3 text-3xl font-bold text-blue-600">
                                    {
                                        orderStats.liveOrders
                                            .length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Orders requiring action
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                                🛍️
                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* ORDER QUEUE */}
                {/* ================================================= */}

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <div className="flex items-center gap-2">

                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </span>

                                <h2 className="text-base font-bold text-slate-900">
                                    Live Order Queue
                                </h2>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                                Orders currently being processed
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/orders")
                            }
                            className="text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                            Manage all orders →
                        </button>

                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">

                        {/* PLACED */}

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                                New
                            </p>

                            <p className="mt-2 text-3xl font-bold text-blue-700">
                                {
                                    orderStats.placed.length
                                }
                            </p>

                            <p className="mt-1 text-xs text-blue-600">
                                Placed orders
                            </p>

                        </div>

                        {/* PREPARING */}

                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                Processing
                            </p>

                            <p className="mt-2 text-3xl font-bold text-amber-700">
                                {
                                    orderStats.preparing.length
                                }
                            </p>

                            <p className="mt-1 text-xs text-amber-600">
                                Preparing orders
                            </p>

                        </div>

                        {/* READY */}

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                Ready
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-700">
                                {
                                    orderStats.ready.length
                                }
                            </p>

                            <p className="mt-1 text-xs text-emerald-600">
                                Ready for delivery
                            </p>

                        </div>

                    </div>

                </section>

                {/* ================================================= */}
                {/* INVENTORY + REVENUE */}
                {/* ================================================= */}

                <div className="mt-6 grid gap-6 lg:grid-cols-2">

                    {/* INVENTORY HEALTH */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Inventory Health
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current stock condition
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/inventory"
                                    )
                                }
                                className="text-xs font-bold text-slate-500 hover:text-slate-900"
                            >
                                Inventory →
                            </button>

                        </div>

                        <div className="mt-6 flex items-center gap-5">

                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[8px] border-emerald-100">

                                <span className="text-xl font-bold text-slate-900">
                                    {
                                        inventoryStats.health
                                    }%
                                </span>

                            </div>

                            <div className="flex-1">

                                <div className="flex items-center justify-between">

                                    <span className="text-xs text-slate-500">
                                        Healthy stock
                                    </span>

                                    <span className="text-xs font-bold text-emerald-600">
                                        {
                                            inventoryStats
                                                .healthyStock
                                                .length
                                        }
                                    </span>

                                </div>

                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{
                                            width: `${inventoryStats.health}%`,
                                        }}
                                    />

                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-amber-50 p-3">

                                        <p className="text-lg font-bold text-amber-700">
                                            {
                                                inventoryStats
                                                    .lowStock
                                                    .length
                                            }
                                        </p>

                                        <p className="text-[10px] font-bold uppercase text-amber-500">
                                            Low Stock
                                        </p>

                                    </div>

                                    <div className="rounded-xl bg-red-50 p-3">

                                        <p className="text-lg font-bold text-red-700">
                                            {
                                                inventoryStats
                                                    .outOfStock
                                                    .length
                                            }
                                        </p>

                                        <p className="text-[10px] font-bold uppercase text-red-500">
                                            Out of Stock
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* SALES */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Order Summary
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                ₹
                                {Number(
                                    orderStats.totalRevenue
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Revenue from non-cancelled orders
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">

                            <div className="rounded-2xl bg-slate-50 p-4">

                                <p className="text-2xl font-bold text-slate-900">
                                    {
                                        orderStats
                                            .delivered
                                            .length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Delivered
                                </p>

                            </div>

                            <div className="rounded-2xl bg-red-50 p-4">

                                <p className="text-2xl font-bold text-red-600">
                                    {
                                        orderStats
                                            .cancelled
                                            .length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-red-400">
                                    Cancelled
                                </p>

                            </div>

                        </div>

                    </section>

                </div>

                {/* ================================================= */}
                {/* ALERTS + RECENT ORDERS */}
                {/* ================================================= */}

                <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">

                    {/* STOCK ALERTS */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Stock Alerts
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Products needing attention
                                </p>
                            </div>

                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                                {
                                    inventoryStats
                                        .lowStock
                                        .length +
                                    inventoryStats
                                        .outOfStock
                                        .length
                                }
                            </span>

                        </div>

                        <div className="mt-5 space-y-3">

                            {[
                                ...inventoryStats.outOfStock,
                                ...inventoryStats.lowStock,
                            ]
                                .slice(0, 6)
                                .map(
                                    (product) => {

                                        const quantity =
                                            Number(
                                                product.quantity ||
                                                0
                                            );

                                        const isOut =
                                            quantity <= 0 ||
                                            product.isAvailable ===
                                                false;

                                        return (
                                            <div
                                                key={
                                                    product._id
                                                }
                                                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                                            >

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {
                                                            product.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-[10px] uppercase text-slate-400">
                                                        {
                                                            product.category ||
                                                            "Product"
                                                        }
                                                    </p>

                                                </div>

                                                <div className="ml-3 text-right">

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                            isOut
                                                                ? "bg-red-50 text-red-600"
                                                                : "bg-amber-50 text-amber-600"
                                                        }`}
                                                    >
                                                        {isOut
                                                            ? "OUT"
                                                            : `${quantity} left`}
                                                    </span>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            {inventoryStats.lowStock.length ===
                                0 &&
                                inventoryStats.outOfStock.length ===
                                    0 && (
                                    <div className="rounded-2xl bg-emerald-50 p-6 text-center">

                                        <div className="text-3xl">
                                            ✓
                                        </div>

                                        <p className="mt-2 text-sm font-bold text-emerald-700">
                                            Inventory looks good
                                        </p>

                                        <p className="mt-1 text-xs text-emerald-600">
                                            No stock alerts right now.
                                        </p>

                                    </div>
                                )}

                        </div>

                    </section>

                    {/* RECENT ORDERS */}

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Recent Orders
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Latest customer orders
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/orders"
                                    )
                                }
                                className="text-xs font-bold text-slate-500 hover:text-slate-900"
                            >
                                View all →
                            </button>

                        </div>

                        <div className="mt-5 divide-y divide-slate-100">

                            {orders
                                .slice(0, 6)
                                .map(
                                    (order) => (
                                        <button
                                            type="button"
                                            key={
                                                order._id
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/admin/orders/${order._id}`
                                                )
                                            }
                                            className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-slate-50"
                                        >

                                            <div className="min-w-0">

                                                <p className="text-sm font-bold text-slate-800">
                                                    #
                                                    {order._id
                                                        ?.slice(
                                                            -8
                                                        )
                                                        .toUpperCase()}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-slate-400">
                                                    {
                                                        order.customerName ||
                                                        order.user
                                                            ?.fullname ||
                                                        order.user
                                                            ?.name ||
                                                        "Customer"
                                                    }
                                                </p>

                                            </div>

                                            <div className="shrink-0 text-right">

                                                <span
                                                    className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusStyle(
                                                        order.status
                                                    )}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>

                                                <p className="mt-1 text-xs font-bold text-slate-800">
                                                    ₹
                                                    {Number(
                                                        order.total ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                            </div>

                                        </button>
                                    )
                                )}

                            {orders.length ===
                                0 && (
                                <div className="py-10 text-center">

                                    <div className="text-4xl">
                                        🛍️
                                    </div>

                                    <p className="mt-3 text-sm font-bold text-slate-700">
                                        No orders yet
                                    </p>

                                </div>
                            )}

                        </div>

                    </section>

                </div>

                {/* ================================================= */}
                {/* QUICK ACTIONS */}
                {/* ================================================= */}

                <section className="mt-6 pb-8">

                    <h2 className="text-base font-bold text-slate-900">
                        Quick Actions
                    </h2>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/orders"
                                )
                            }
                            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="text-xl">
                                🛒
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-900">
                                Manage Orders
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Update order status
                            </p>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/inventory"
                                )
                            }
                            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="text-xl">
                                📦
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-900">
                                Inventory
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Manage stock levels
                            </p>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/menu"
                                )
                            }
                            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="text-xl">
                                🏷️
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-900">
                                Products
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Manage products
                            </p>
                        </button>

                        <button
                            onClick={() =>
                                fetchDashboard(true)
                            }
                            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="text-xl">
                                🔄
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-900">
                                Refresh Data
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Get latest information
                            </p>
                        </button>

                    </div>

                </section>

            </div>
        </div>
    );
};

export default AdminDashboard;