import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import axios from "axios";


const MyOrders = () => {
    const navigate =
        useNavigate();

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    const fetchOrders = async () => {
        try {
            setLoading(true);

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                navigate("/login");
                return;
            }


            const res =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/orders/my`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            setOrders(
                res.data?.data?.orders ||
                []
            );

        } catch (error) {
            console.error(
                "Fetch orders error:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to load orders."
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
    }, []);


    const getStatusClass =
        (status) => {
            if (
                status ===
                "Delivered"
            ) {
                return "bg-emerald-50 text-emerald-600";
            }

            if (
                status ===
                "Cancelled"
            ) {
                return "bg-red-50 text-red-600";
            }

            if (
                status ===
                "Preparing"
            ) {
                return "bg-[#f2e4dc] text-[#984126]";
            }

            if (
                status ===
                "Ready"
            ) {
                return "bg-blue-50 text-blue-600";
            }

            return "bg-[#e5ded3] text-[#5d554c]";
        };


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#eee8de]">
                <p className="text-sm text-[#746b61]">
                    Loading your orders...
                </p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#eee8de] px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#a94b2e]">
                        Account
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#24211d]">
                        My Orders
                    </h1>

                    <p className="mt-2 text-sm text-[#877d72]">
                        Track your orders and
                        manage your purchases.
                    </p>
                </div>


                {orders.length === 0 ? (
                    <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-12 text-center">
                        <div className="text-5xl">
                            📦
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-[#24211d]">
                            No orders yet
                        </h2>

                        <button
                            onClick={() =>
                                navigate(
                                    "/"
                                )
                            }
                            className="mt-5 rounded-xl bg-[#24211d] px-5 py-3 text-xs font-bold text-[#f8f4ec]"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {orders.map(
                            (order) => (
                                <div
                                    key={
                                        order._id
                                    }
                                    className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-6"
                                >

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#877d72]">
                                                Order
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-[#302b26]">
                                                #
                                                {order._id
                                                    .slice(
                                                        -8
                                                    )
                                                    .toUpperCase()}
                                            </p>

                                            <p className="mt-1 text-xs text-[#877d72]">
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </div>


                                        <span
                                            className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusClass(
                                                order.status
                                            )}`}
                                        >
                                            {
                                                order.status
                                            }
                                        </span>

                                    </div>


                                    <div className="mt-5 border-t border-[#e0d8cd] pt-5">
                                        {order.items?.map((item, index) => {
                                            const product = item.foodCard;

                                            const image =
                                                product?.imageUrl ||
                                                product?.images?.[0] ||
                                                null;

                                            return (
                                                <div
                                                    key={item._id || index}
                                                    className="flex items-center justify-between gap-4 py-3"
                                                >
                                                    {/* PRODUCT */}
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {/* IMAGE */}
                                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#d5cec2] bg-[#e5ded3]">
                                                            {image ? (
                                                                <img
                                                                    src={image}
                                                                    alt={item.name || "Product"}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        console.error(
                                                                            "Product image failed:",
                                                                            image
                                                                        );

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

                                                        {/* NAME + QUANTITY */}
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-[#302b26]">
                                                                {item.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#877d72]">
                                                                Qty: {item.quantity}
                                                                {item.size
                                                                    ? ` / Size: ${item.size}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* PRICE */}
                                                    <p className="flex-shrink-0 text-sm font-bold text-[#302b26]">
                                                        ₹
                                                        {Number(
                                                            item.lineTotal || 0
                                                        ).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>


                                    <div className="mt-5 flex items-center justify-between border-t border-[#e0d8cd] pt-5">

                                        <div>
                                            <p className="text-xs text-[#877d72]">
                                                Total
                                            </p>

                                            <p className="text-lg font-bold text-[#24211d]">
                                                ₹
                                                {Number(
                                                    order.total ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
                                        </div>


                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/orders/${order._id}`
                                                )
                                            }
                                            className="rounded-xl bg-[#24211d] px-4 py-2.5 text-xs font-bold text-[#f8f4ec]"
                                        >
                                            View Details
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>
        </div>
    );
};


export default MyOrders;
