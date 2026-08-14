import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import axios from "axios";


const STATUS_OPTIONS = [
    "Placed",
    "Confirmed",
    "Preparing",
    "Ready",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
];


const PAYMENT_OPTIONS = [
    "Pending",
    "Paid",
    "Failed",
    "Refunded",
];


// =========================================================
// STATUS STYLE
// =========================================================

const getStatusClass = (
    status
) => {
    switch (status) {
        case "Placed":
            return "bg-slate-100 text-slate-700";

        case "Confirmed":
            return "bg-blue-50 text-blue-700";

        case "Preparing":
            return "bg-amber-50 text-amber-700";

        case "Ready":
            return "bg-indigo-50 text-indigo-700";

        case "Shipped":
            return "bg-purple-50 text-purple-700";

        case "Out for Delivery":
            return "bg-cyan-50 text-cyan-700";

        case "Delivered":
            return "bg-emerald-50 text-emerald-700";

        case "Cancelled":
            return "bg-red-50 text-red-700";

        default:
            return "bg-slate-100 text-slate-600";
    }
};


// =========================================================
// PAYMENT STYLE
// =========================================================

const getPaymentClass = (
    status
) => {
    switch (status) {
        case "Paid":
            return "bg-emerald-50 text-emerald-700";

        case "Pending":
            return "bg-amber-50 text-amber-700";

        case "Failed":
            return "bg-red-50 text-red-700";

        case "Refunded":
            return "bg-purple-50 text-purple-700";

        default:
            return "bg-slate-100 text-slate-600";
    }
};


// =========================================================
// IMAGE HELPER
// =========================================================

const getProductImage = (
    item
) => {

    if (
        item?.image
    ) {
        return item.image;
    }

    if (
        item?.imageUrl
    ) {
        return item.imageUrl;
    }

    if (
        Array.isArray(
            item?.images
        ) &&
        item.images.length > 0
    ) {
        return item.images[0];
    }

    if (
        item?.product?.image
    ) {
        return item.product.image;
    }

    if (
        Array.isArray(
            item?.product?.images
        ) &&
        item.product.images.length > 0
    ) {
        return item.product.images[0];
    }

    return null;
};


// =========================================================
// COMPONENT
// =========================================================

const AdminOrders = () => {

    const navigate =
        useNavigate();


    const [
        orders,
        setOrders,
    ] = useState([]);


    const [
        selectedOrder,
        setSelectedOrder,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);


    const [
        updating,
        setUpdating,
    ] = useState(false);


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");


    const [
        paymentFilter,
        setPaymentFilter,
    ] = useState("All");


    const [
        sort,
        setSort,
    ] = useState("newest");


    const [
        page,
        setPage,
    ] = useState(1);


    const [
        pagination,
        setPagination,
    ] = useState({
        page: 1,
        limit: 10,
        totalOrders: 0,
        totalPages: 1,
    });


    const [
        statusNote,
        setStatusNote,
    ] = useState("");


    const [
        newStatus,
        setNewStatus,
    ] = useState("");


    // =====================================================
    // ADMIN TOKEN
    // =====================================================

    const getAdminToken = () => {
        return localStorage.getItem(
            "adminToken"
        );
    };


    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const fetchOrders = async (
        requestedPage = page
    ) => {

        try {
            setLoading(true);

            const token =
                getAdminToken();

            if (!token) {
                navigate(
                    "/admin/login"
                );

                return;
            }


            const response =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/admin/orders`,
                    {
                        params: {
                            page:
                                requestedPage,

                            limit: 10,

                            search,

                            status:
                                statusFilter,

                            paymentStatus:
                                paymentFilter,

                            sort,
                        },

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const data =
                response.data?.data;


            setOrders(
                data?.orders || []
            );


            setPagination(
                data?.pagination || {
                    page:
                        requestedPage,

                    limit: 10,

                    totalOrders:
                        data?.orders
                            ?.length ||
                        0,

                    totalPages: 1,
                }
            );

        } catch (error) {

            console.error(
                "Admin orders error:",
                error
            );


            if (
                error?.response?.status ===
                401
            ) {
                localStorage.removeItem(
                    "adminToken"
                );

                navigate(
                    "/admin/login"
                );

                return;
            }


            alert(
                error?.response?.data
                    ?.message ||
                "Failed to load orders."
            );

        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL FETCH
    // =====================================================

    useEffect(() => {
        fetchOrders(1);
    }, [
        statusFilter,
        paymentFilter,
        sort,
    ]);


    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                setPage(1);

                fetchOrders(1);

            }, 500);


        return () =>
            clearTimeout(
                timer
            );

    }, [search]);


    // =====================================================
    // OPEN ORDER
    // =====================================================

    const openOrder = async (
        orderId
    ) => {

        try {

            setDetailLoading(
                true
            );


            const token =
                getAdminToken();


            const response =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/admin/orders/${orderId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const order =
                response.data?.data
                    ?.order;


            setSelectedOrder(
                order || null
            );


            setNewStatus(
                order?.status || ""
            );


            setStatusNote("");

        } catch (error) {

            console.error(
                "Admin order detail error:",
                error
            );


            alert(
                error?.response?.data
                    ?.message ||
                "Failed to load order details."
            );

        } finally {
            setDetailLoading(
                false
            );
        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleUpdateStatus =
        async () => {

            if (
                !selectedOrder ||
                !newStatus
            ) {
                return;
            }


            if (
                newStatus ===
                selectedOrder.status
            ) {
                alert(
                    "Please select a different status."
                );

                return;
            }


            try {

                setUpdating(
                    true
                );


                const token =
                    getAdminToken();


                const response =
                    await axios.patch(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/orders/${selectedOrder._id}/status`,

                        {
                            status:
                                newStatus,

                            note:
                                statusNote,
                        },

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const updatedOrder =
                    response.data?.data
                        ?.order;


                if (
                    updatedOrder
                ) {

                    setSelectedOrder(
                        updatedOrder
                    );

                    setNewStatus(
                        updatedOrder.status
                    );

                    setOrders(
                        (current) =>
                            current.map(
                                (
                                    order
                                ) =>
                                    order._id ===
                                    updatedOrder._id
                                        ? updatedOrder
                                        : order
                            )
                    );
                }


                setStatusNote("");


                alert(
                    "Order status updated successfully."
                );

            } catch (error) {

                console.error(
                    "Update order status error:",
                    error
                );


                alert(
                    error?.response?.data
                        ?.message ||
                    "Failed to update order status."
                );

            } finally {
                setUpdating(
                    false
                );
            }
        };


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    const handleCancelOrder =
        async () => {

            if (
                !selectedOrder
            ) {
                return;
            }


            if (
                selectedOrder.status ===
                "Delivered"
            ) {
                alert(
                    "Delivered orders cannot be cancelled."
                );

                return;
            }


            if (
                selectedOrder.status ===
                "Cancelled"
            ) {
                alert(
                    "Order is already cancelled."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to cancel order #${selectedOrder._id
                        .slice(-8)
                        .toUpperCase()}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setUpdating(
                    true
                );


                const token =
                    getAdminToken();


                const response =
                    await axios.patch(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/admin/orders/${selectedOrder._id}/cancel`,

                        {
                            note:
                                "Order cancelled by admin.",
                        },

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const updatedOrder =
                    response.data?.data
                        ?.order;


                if (
                    updatedOrder
                ) {

                    setSelectedOrder(
                        updatedOrder
                    );


                    setNewStatus(
                        updatedOrder.status
                    );


                    setOrders(
                        (current) =>
                            current.map(
                                (
                                    order
                                ) =>
                                    order._id ===
                                    updatedOrder._id
                                        ? updatedOrder
                                        : order
                            )
                    );
                }


                alert(
                    "Order cancelled successfully."
                );

            } catch (error) {

                console.error(
                    "Cancel order error:",
                    error
                );


                alert(
                    error?.response?.data
                        ?.message ||
                    "Failed to cancel order."
                );

            } finally {
                setUpdating(
                    false
                );
            }
        };


    // =====================================================
    // SUMMARY
    // =====================================================

    const summary =
        useMemo(() => {

            const total =
                pagination.totalOrders ||
                0;

            const pending =
                orders.filter(
                    (order) =>
                        [
                            "Placed",
                            "Confirmed",
                        ].includes(
                            order.status
                        )
                ).length;

            const preparing =
                orders.filter(
                    (order) =>
                        [
                            "Preparing",
                            "Ready",
                        ].includes(
                            order.status
                        )
                ).length;

            const delivered =
                orders.filter(
                    (order) =>
                        order.status ===
                        "Delivered"
                ).length;

            return {
                total,
                pending,
                preparing,
                delivered,
            };

        }, [
            orders,
            pagination.totalOrders,
        ]);


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short",
            }
        );
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading &&
        orders.length === 0
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading orders...
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
                            Admin Panel
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Orders
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage customer orders,
                            payments and fulfilment.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchOrders(
                                page
                            )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:w-auto"
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* ================================================= */}
                {/* SUMMARY CARDS */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-400">
                            Total Orders
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {
                                summary.total
                            }
                        </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-400">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {
                                summary.pending
                            }
                        </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-400">
                            Processing
                        </p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {
                                summary.preparing
                            }
                        </p>
                    </div>


                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium text-slate-400">
                            Delivered
                        </p>

                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                            {
                                summary.delivered
                            }
                        </p>
                    </div>

                </div>


                {/* ================================================= */}
                {/* FILTERS */}
                {/* ================================================= */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_160px]">

                        {/* SEARCH */}

                        <div className="relative">

                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                🔍
                            </span>

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search order, customer, phone..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                            />

                        </div>


                        {/* STATUS */}

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                e
                            ) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none"
                        >

                            <option value="All">
                                All Status
                            </option>

                            {STATUS_OPTIONS.map(
                                (
                                    status
                                ) => (
                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {
                                            status
                                        }
                                    </option>
                                )
                            )}

                        </select>


                        {/* PAYMENT */}

                        <select
                            value={
                                paymentFilter
                            }
                            onChange={(
                                e
                            ) =>
                                setPaymentFilter(
                                    e.target.value
                                )
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none"
                        >

                            <option value="All">
                                All Payments
                            </option>

                            {PAYMENT_OPTIONS.map(
                                (
                                    status
                                ) => (
                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {
                                            status
                                        }
                                    </option>
                                )
                            )}

                        </select>


                        {/* SORT */}

                        <select
                            value={
                                sort
                            }
                            onChange={(
                                e
                            ) =>
                                setSort(
                                    e.target.value
                                )
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none"
                        >

                            <option value="newest">
                                Newest
                            </option>

                            <option value="oldest">
                                Oldest
                            </option>

                            <option value="highest">
                                Highest Total
                            </option>

                            <option value="lowest">
                                Lowest Total
                            </option>

                        </select>

                    </div>

                </div>


                {/* ================================================= */}
                {/* ORDERS */}
                {/* ================================================= */}

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    <div className="hidden overflow-x-auto lg:block">

                        <table className="w-full">

                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Order
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Customer
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Items
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Total
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Payment
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Action
                                    </th>

                                </tr>
                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {orders.map(
                                    (
                                        order
                                    ) => (

                                        <tr
                                            key={
                                                order._id
                                            }
                                            className="transition hover:bg-slate-50/70"
                                        >

                                            <td className="px-6 py-5">

                                                <p className="text-sm font-bold text-slate-900">
                                                    #
                                                    {order._id
                                                        .slice(
                                                            -8
                                                        )
                                                        .toUpperCase()}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {
                                                        formatDate(
                                                            order.createdAt
                                                        )
                                                    }
                                                </p>

                                            </td>


                                            <td className="px-6 py-5">

                                                <p className="text-sm font-semibold text-slate-800">
                                                    {
                                                        order.customerName ||
                                                        "Customer"
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {
                                                        order.customerPhone ||
                                                        order.customerEmail ||
                                                        "-"
                                                    }
                                                </p>

                                            </td>


                                            <td className="px-6 py-5">

                                                <p className="text-sm font-semibold text-slate-700">
                                                    {
                                                        order.items
                                                            ?.length ||
                                                        0
                                                    }{" "}
                                                    products
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {(
                                                        order.items ||
                                                        []
                                                    ).reduce(
                                                        (
                                                            total,
                                                            item
                                                        ) =>
                                                            total +
                                                            Number(
                                                                item.quantity ||
                                                                    0
                                                            ),
                                                        0
                                                    )}{" "}
                                                    units
                                                </p>

                                            </td>


                                            <td className="px-6 py-5">

                                                <p className="text-sm font-bold text-slate-900">
                                                    ₹
                                                    {Number(
                                                        order.total ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                            </td>


                                            <td className="px-6 py-5">

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPaymentClass(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {
                                                        order.paymentStatus ||
                                                        "Pending"
                                                    }
                                                </span>

                                            </td>


                                            <td className="px-6 py-5">

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                                        order.status
                                                    )}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>

                                            </td>


                                            <td className="px-6 py-5 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openOrder(
                                                            order._id
                                                        )
                                                    }
                                                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ================================================= */}
                    {/* MOBILE */}
                    {/* ================================================= */}

                    <div className="divide-y divide-slate-100 lg:hidden">

                        {orders.map(
                            (
                                order
                            ) => (

                                <div
                                    key={
                                        order._id
                                    }
                                    className="p-4 sm:p-5"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <p className="text-sm font-bold text-slate-900">
                                                #
                                                {order._id
                                                    .slice(
                                                        -8
                                                    )
                                                    .toUpperCase()}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    formatDate(
                                                        order.createdAt
                                                    )
                                                }
                                            </p>

                                        </div>


                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                                order.status
                                            )}`}
                                        >
                                            {
                                                order.status
                                            }
                                        </span>

                                    </div>


                                    <div className="mt-4 grid grid-cols-2 gap-4">

                                        <div>

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Customer
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {
                                                    order.customerName ||
                                                    "Customer"
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Total
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-slate-900">
                                                ₹
                                                {Number(
                                                    order.total ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mt-4 flex items-center justify-between">

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPaymentClass(
                                                order.paymentStatus
                                            )}`}
                                        >
                                            Payment:{" "}
                                            {
                                                order.paymentStatus ||
                                                "Pending"
                                            }
                                        </span>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                openOrder(
                                                    order._id
                                                )
                                            }
                                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                                        >
                                            View Details
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>


                    {/* ================================================= */}
                    {/* EMPTY */}
                    {/* ================================================= */}

                    {orders.length ===
                        0 && (
                        <div className="p-12 text-center">

                            <div className="text-4xl">
                                📦
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                No orders found
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Try changing your
                                search or filters.
                            </p>

                        </div>
                    )}

                </div>


                {/* ================================================= */}
                {/* PAGINATION */}
                {/* ================================================= */}

                {pagination.totalPages >
                    1 && (

                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">

                        <p className="text-xs text-slate-500">
                            Page{" "}
                            <span className="font-bold text-slate-800">
                                {
                                    pagination.page
                                }
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-slate-800">
                                {
                                    pagination.totalPages
                                }
                            </span>
                        </p>


                        <div className="flex gap-2">

                            <button
                                type="button"
                                disabled={
                                    pagination.page <=
                                    1
                                }
                                onClick={() => {
                                    const nextPage =
                                        pagination.page -
                                        1;

                                    setPage(
                                        nextPage
                                    );

                                    fetchOrders(
                                        nextPage
                                    );
                                }}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>


                            <button
                                type="button"
                                disabled={
                                    pagination.page >=
                                    pagination.totalPages
                                }
                                onClick={() => {
                                    const nextPage =
                                        pagination.page +
                                        1;

                                    setPage(
                                        nextPage
                                    );

                                    fetchOrders(
                                        nextPage
                                    );
                                }}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            </div>


            {/* ===================================================== */}
            {/* ORDER DETAIL MODAL */}
            {/* ===================================================== */}

            {(selectedOrder ||
                detailLoading) && (

                <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">

                    <div className="flex min-h-full items-center justify-center">

                        <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                            {detailLoading ? (

                                <div className="flex min-h-[400px] items-center justify-center">

                                    <div className="text-center">

                                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                                        <p className="mt-4 text-sm text-slate-500">
                                            Loading order...
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <>
                                    {/* ================================= */}
                                    {/* MODAL HEADER */}
                                    {/* ================================= */}

                                    <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                                Order Details
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                #
                                                {selectedOrder._id
                                                    .slice(
                                                        -8
                                                    )
                                                    .toUpperCase()}
                                            </h2>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    formatDate(
                                                        selectedOrder.createdAt
                                                    )
                                                }
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedOrder(
                                                    null
                                                )
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                        >
                                            ✕
                                        </button>

                                    </div>


                                    <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">

                                        {/* ============================= */}
                                        {/* CUSTOMER + STATUS */}
                                        {/* ============================= */}

                                        <div className="grid gap-5 lg:grid-cols-2">

                                            <div className="rounded-2xl border border-slate-200 p-5">

                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Customer
                                                </p>

                                                <p className="mt-3 text-base font-bold text-slate-900">
                                                    {
                                                        selectedOrder.customerName ||
                                                        "Customer"
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {
                                                        selectedOrder.customerEmail ||
                                                        "-"
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {
                                                        selectedOrder.customerPhone ||
                                                        "-"
                                                    }
                                                </p>

                                            </div>


                                            <div className="rounded-2xl border border-slate-200 p-5">

                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                    Order Status
                                                </p>


                                                <div className="mt-3">

                                                    <span
                                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                                                            selectedOrder.status
                                                        )}`}
                                                    >
                                                        {
                                                            selectedOrder.status
                                                        }
                                                    </span>

                                                </div>


                                                {selectedOrder.status !==
                                                    "Delivered" &&
                                                    selectedOrder.status !==
                                                        "Cancelled" && (

                                                    <div className="mt-4">

                                                        <select
                                                            value={
                                                                newStatus
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                setNewStatus(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none"
                                                        >

                                                            {STATUS_OPTIONS.map(
                                                                (
                                                                    status
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            status
                                                                        }
                                                                        value={
                                                                            status
                                                                        }
                                                                    >
                                                                        {
                                                                            status
                                                                        }
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>


                                                        <textarea
                                                            value={
                                                                statusNote
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                setStatusNote(
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Optional status note..."
                                                            rows={
                                                                2
                                                            }
                                                            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none"
                                                        />


                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating ||
                                                                newStatus ===
                                                                    selectedOrder.status
                                                            }
                                                            onClick={
                                                                handleUpdateStatus
                                                            }
                                                            className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            {updating
                                                                ? "Updating..."
                                                                : "Update Status"}
                                                        </button>

                                                    </div>
                                                )}

                                            </div>

                                        </div>


                                        {/* ============================= */}
                                        {/* PRODUCTS */}
                                        {/* ============================= */}

                                        <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                                            <div className="flex items-center justify-between">

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Products
                                                </h3>

                                                <span className="text-xs text-slate-400">
                                                    {
                                                        selectedOrder.items
                                                            ?.length ||
                                                        0
                                                    }{" "}
                                                    items
                                                </span>

                                            </div>


                                            <div className="mt-4 divide-y divide-slate-100">

                                                {selectedOrder.items?.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const image =
                                                            getProductImage(
                                                                item
                                                            );

                                                        return (

                                                            <div
                                                                key={
                                                                    item._id ||
                                                                    index
                                                                }
                                                                className="flex gap-4 py-4"
                                                            >

                                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                                                    {image ? (

                                                                        <img
                                                                            src={
                                                                                image
                                                                            }
                                                                            alt={
                                                                                item.name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.currentTarget.style.display =
                                                                                    "none";
                                                                            }}
                                                                        />

                                                                    ) : (

                                                                        <div className="flex h-full w-full items-center justify-center text-xl">
                                                                            📦
                                                                        </div>
                                                                    )}

                                                                </div>


                                                                <div className="min-w-0 flex-1">

                                                                    <p className="text-sm font-bold text-slate-800">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-slate-400">
                                                                        ₹
                                                                        {Number(
                                                                            item.unitPrice ||
                                                                                0
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )}{" "}
                                                                        ×{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>

                                                                </div>


                                                                <p className="text-sm font-bold text-slate-900">
                                                                    ₹
                                                                    {Number(
                                                                        item.lineTotal ||
                                                                            0
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </p>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>


                                            <div className="mt-4 border-t border-slate-100 pt-4">

                                                <div className="flex justify-between text-sm">

                                                    <span className="text-slate-400">
                                                        Subtotal
                                                    </span>

                                                    <span className="font-semibold">
                                                        ₹
                                                        {Number(
                                                            selectedOrder.subtotal ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="mt-2 flex justify-between text-sm">

                                                    <span className="text-slate-400">
                                                        Tax
                                                    </span>

                                                    <span className="font-semibold">
                                                        ₹
                                                        {Number(
                                                            selectedOrder.tax ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">

                                                    <span className="font-bold text-slate-900">
                                                        Total
                                                    </span>

                                                    <span className="text-xl font-bold text-slate-900">
                                                        ₹
                                                        {Number(
                                                            selectedOrder.total ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ============================= */}
                                        {/* ADDRESS */}
                                        {/* ============================= */}

                                        <div className="mt-5 grid gap-5 lg:grid-cols-2">

                                            <div className="rounded-2xl border border-slate-200 p-5">

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Delivery Address
                                                </h3>


                                                <div className="mt-3 rounded-xl bg-slate-50 p-4">

                                                    <p className="text-sm font-bold text-slate-900">
                                                        {
                                                            selectedOrder
                                                                .deliveryAddress
                                                                ?.name
                                                        }
                                                    </p>

                                                    <p className="mt-2 text-xs leading-6 text-slate-500">

                                                        {
                                                            selectedOrder
                                                                .deliveryAddress
                                                                ?.addressLine1
                                                        }

                                                        {selectedOrder
                                                            .deliveryAddress
                                                            ?.addressLine2 &&
                                                            `, ${selectedOrder.deliveryAddress.addressLine2}`}

                                                        {selectedOrder
                                                            .deliveryAddress
                                                            ?.city &&
                                                            `, ${selectedOrder.deliveryAddress.city}`}

                                                        {selectedOrder
                                                            .deliveryAddress
                                                            ?.state &&
                                                            `, ${selectedOrder.deliveryAddress.state}`}

                                                        {selectedOrder
                                                            .deliveryAddress
                                                            ?.pincode &&
                                                            ` - ${selectedOrder.deliveryAddress.pincode}`}

                                                    </p>

                                                    <p className="mt-2 text-xs font-medium text-slate-600">
                                                        📞{" "}
                                                        {
                                                            selectedOrder
                                                                .deliveryAddress
                                                                ?.phone
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            {/* PAYMENT */}

                                            <div className="rounded-2xl border border-slate-200 p-5">

                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Payment
                                                </h3>


                                                <div className="mt-4 space-y-3">

                                                    <div className="flex justify-between gap-4">

                                                        <span className="text-xs text-slate-400">
                                                            Status
                                                        </span>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPaymentClass(
                                                                selectedOrder.paymentStatus
                                                            )}`}
                                                        >
                                                            {
                                                                selectedOrder.paymentStatus ||
                                                                "Pending"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="flex justify-between gap-4">

                                                        <span className="text-xs text-slate-400">
                                                            Method
                                                        </span>

                                                        <span className="text-xs font-semibold text-slate-700">
                                                            {
                                                                selectedOrder.paymentMode ||
                                                                "Razorpay"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="flex justify-between gap-4">

                                                        <span className="text-xs text-slate-400">
                                                            Payment ID
                                                        </span>

                                                        <span className="max-w-[180px] truncate text-xs font-semibold text-slate-700">
                                                            {
                                                                selectedOrder.razorpayPaymentId ||
                                                                selectedOrder.paymentId ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ============================= */}
                                        {/* TIMELINE */}
                                        {/* ============================= */}

                                        <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                                            <h3 className="text-sm font-bold text-slate-900">
                                                Order Timeline
                                            </h3>


                                            <div className="mt-5">

                                                {selectedOrder.statusTimeline
                                                    ?.length ? (

                                                    selectedOrder.statusTimeline.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <div
                                                                key={
                                                                    index
                                                                }
                                                                className="flex gap-4"
                                                            >

                                                                <div className="flex flex-col items-center">

                                                                    <div className="h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-50" />

                                                                    {index <
                                                                        selectedOrder
                                                                            .statusTimeline
                                                                            .length -
                                                                            1 && (
                                                                        <div className="mt-1 min-h-10 w-px bg-slate-200" />
                                                                    )}

                                                                </div>


                                                                <div className="pb-5">

                                                                    <p className="text-sm font-bold text-slate-800">
                                                                        {
                                                                            item.status
                                                                        }
                                                                    </p>

                                                                    {item.note && (
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            {
                                                                                item.note
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                                        {
                                                                            formatDate(
                                                                                item.at
                                                                            )
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>
                                                        )
                                                    )

                                                ) : (

                                                    <p className="text-sm text-slate-400">
                                                        No timeline available.
                                                    </p>

                                                )}

                                            </div>

                                        </div>


                                        {/* ============================= */}
                                        {/* CANCEL */}
                                        {/* ============================= */}

                                        {selectedOrder.status !==
                                            "Delivered" &&
                                            selectedOrder.status !==
                                                "Cancelled" && (

                                            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                    <div>

                                                        <h3 className="text-sm font-bold text-red-700">
                                                            Cancel Order
                                                        </h3>

                                                        <p className="mt-1 text-xs leading-5 text-red-500">
                                                            Cancelling this order
                                                            will permanently mark
                                                            it as cancelled.
                                                        </p>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        disabled={
                                                            updating
                                                        }
                                                        onClick={
                                                            handleCancelOrder
                                                        }
                                                        className="rounded-xl border border-red-200 bg-white px-5 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        Cancel Order
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};


export default AdminOrders;