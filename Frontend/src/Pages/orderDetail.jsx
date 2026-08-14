import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import axios from "axios";


const OrderDetails = () => {
    const { id } =
        useParams();

    const navigate =
        useNavigate();


    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [cancelling, setCancelling] =
        useState(false);


    const fetchOrder = async () => {
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
                    `${import.meta.env.VITE_BASE_URL}/api/v1/orders/my/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            setOrder(
                res.data?.data?.order ||
                null
            );

        } catch (error) {
            console.error(
                "Fetch order error:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to load order."
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrder();
    }, [id]);


    const handleCancel =
        async () => {

            if (!order) return;


            if (
                order.status !==
                "Placed"
            ) {
                alert(
                    "This order can no longer be cancelled."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel this order?"
                );


            if (!confirmed) return;


            try {
                setCancelling(true);

                const token =
                    localStorage.getItem(
                        "token"
                    );


                const res =
                    await axios.patch(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/orders/my/${order._id}/cancel`,
                        {},
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setOrder(
                    res.data?.data?.order ||
                    order
                );


                alert(
                    "Order cancelled successfully."
                );

            } catch (error) {
                console.error(
                    "Cancel order error:",
                    error
                );

                alert(
                    error?.response?.data?.message ||
                    "Unable to cancel order."
                );

            } finally {
                setCancelling(false);
            }
        };


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Loading order...
                </p>
            </div>
        );
    }


    if (!order) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-lg font-bold">
                        Order not found
                    </h2>

                    <button
                        onClick={() =>
                            navigate(
                                "/orders"
                            )
                        }
                        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white"
                    >
                        My Orders
                    </button>
                </div>
            </div>
        );
    }


    const canCancel =
        order.status ===
        "Placed";


    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">

            <div className="mx-auto max-w-5xl">

                <button
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                    className="mb-6 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                    ← My Orders
                </button>


                <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                        Order Details
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        #
                        {order._id
                            .slice(
                                -8
                            )
                            .toUpperCase()}
                    </h1>
                </div>


                {/* STATUS */}

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-xs text-slate-400">
                                Current Status
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {
                                    order.status
                                }
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-slate-400">
                                Payment
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {
                                    order.paymentStatus
                                }
                            </p>
                        </div>

                    </div>


                    <div className="mt-8 space-y-5">

                        {order.statusTimeline?.map(
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

                                        <div className="h-3 w-3 rounded-full bg-amber-500" />

                                        {index <
                                            order.statusTimeline.length -
                                            1 && (
                                                <div className="mt-1 h-full w-px bg-slate-200" />
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
                                            {new Date(
                                                item.at
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </section>


                {/* PRODUCTS */}

                {/* PRODUCTS */}

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-base font-bold text-slate-900">
                        Items
                    </h2>

                    <div className="mt-5 divide-y divide-slate-100">

                        {order.items?.map(
                            (item, index) => {

                                const product =
                                    item.foodCard;

                                let image =
                                    product?.imageUrl ||
                                    product?.images?.[0] ||
                                    product?.image ||
                                    null;

                                // If image is stored as a relative path
                                if (
                                    image &&
                                    !image.startsWith("http") &&
                                    !image.startsWith("data:")
                                ) {
                                    image =
                                        `${import.meta.env.VITE_BASE_URL}${image}`;
                                }

                                return (
                                    <div
                                        key={
                                            item._id ||
                                            index
                                        }
                                        className="flex items-center justify-between gap-5 py-4"
                                    >

                                        {/* PRODUCT IMAGE + INFO */}

                                        <div className="flex min-w-0 items-center gap-4">

                                            {/* IMAGE */}

                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            item.name ||
                                                            "Product"
                                                        }
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            console.error(
                                                                "Failed to load product image:",
                                                                image
                                                            );

                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-2xl">
                                                        📦
                                                    </div>
                                                )}

                                            </div>

                                            {/* PRODUCT DETAILS */}

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-bold text-slate-800">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    ₹
                                                    {Number(
                                                        item.unitPrice || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                            </div>

                                        </div>

                                        {/* LINE TOTAL */}

                                        <p className="flex-shrink-0 text-sm font-bold text-slate-900">
                                            ₹
                                            {Number(
                                                item.lineTotal || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>

                                    </div>
                                );
                            }
                        )}

                    </div>


                    {/* TOTALS */}

                    <div className="mt-5 border-t border-slate-100 pt-5">

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">
                                Subtotal
                            </span>

                            <span className="font-semibold">
                                ₹
                                {Number(
                                    order.subtotal || 0
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
                                    order.tax || 0
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
                                    order.total || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </span>

                        </div>

                    </div>

                </section>


                {/* ADDRESS */}

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-base font-bold text-slate-900">
                        Delivery Address
                    </h2>


                    <div className="mt-4 rounded-2xl bg-slate-50 p-5">

                        <p className="text-sm font-bold text-slate-900">
                            {
                                order.deliveryAddress
                                    ?.name
                            }
                        </p>

                        <p className="mt-2 text-xs leading-6 text-slate-500">

                            {
                                order.deliveryAddress
                                    ?.addressLine1
                            }

                            {order.deliveryAddress
                                ?.addressLine2 &&
                                `, ${order.deliveryAddress.addressLine2}`}

                            {`, ${order.deliveryAddress?.city}`}

                            {`, ${order.deliveryAddress?.state}`}

                            {` - ${order.deliveryAddress?.pincode}`}

                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-600">
                            📞{" "}
                            {
                                order.deliveryAddress
                                    ?.phone
                            }
                        </p>

                    </div>

                </section>


                {/* CANCEL */}

                {canCancel && (
                    <section className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-6">

                        <h2 className="text-sm font-bold text-red-700">
                            Cancel Order
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-red-500">
                            You can cancel this order
                            while it is still in the
                            Placed state. Once preparation
                            begins, cancellation is no
                            longer available.
                        </p>


                        <button
                            type="button"
                            onClick={
                                handleCancel
                            }
                            disabled={
                                cancelling
                            }
                            className="mt-4 rounded-xl border border-red-200 bg-white px-5 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                            {cancelling
                                ? "Cancelling..."
                                : "Cancel Order"}
                        </button>

                    </section>
                )}

            </div>
        </div>
    );
};


export default OrderDetails;