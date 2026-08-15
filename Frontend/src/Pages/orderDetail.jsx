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
            <div className="flex min-h-screen items-center justify-center bg-[#eee8de]">
                <p className="text-sm text-[#746b61]">
                    Loading order...
                </p>
            </div>
        );
    }


    if (!order) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#eee8de]">
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
                        className="mt-5 rounded-xl bg-[#24211d] px-5 py-3 text-xs font-bold text-[#f8f4ec]"
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
        <div className="min-h-screen bg-[#eee8de] px-4 py-8 sm:px-6">

            <div className="mx-auto max-w-5xl">

                <button
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                    className="mb-6 text-xs font-bold text-[#746b61] hover:text-[#24211d]"
                >
                    ← My Orders
                </button>


                <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#a94b2e]">
                        Order Details
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#24211d]">
                        #
                        {order._id
                            .slice(
                                -8
                            )
                            .toUpperCase()}
                    </h1>
                </div>


                {/* STATUS */}

                <section className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-xs text-[#877d72]">
                                Current Status
                            </p>

                            <p className="mt-1 text-xl font-bold text-[#24211d]">
                                {
                                    order.status
                                }
                            </p>
                        </div>


                        <div>
                            <p className="text-xs text-[#877d72]">
                                Payment
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#302b26]">
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

                                        <div className="h-3 w-3 rounded-full bg-[#f2e4dc]0" />

                                        {index <
                                            order.statusTimeline.length -
                                            1 && (
                                                <div className="mt-1 h-full w-px bg-[#d9d0c4]" />
                                            )}

                                    </div>


                                    <div className="pb-5">

                                        <p className="text-sm font-bold text-[#302b26]">
                                            {
                                                item.status
                                            }
                                        </p>

                                        {item.note && (
                                            <p className="mt-1 text-xs text-[#746b61]">
                                                {
                                                    item.note
                                                }
                                            </p>
                                        )}

                                        <p className="mt-1 text-[10px] text-[#877d72]">
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

                <section className="mt-6 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                    <h2 className="text-base font-bold text-[#24211d]">
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

                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[#d5cec2] bg-[#eee8de]">

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

                                                <p className="truncate text-sm font-bold text-[#302b26]">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-[#877d72]">
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

                                        <p className="flex-shrink-0 text-sm font-bold text-[#24211d]">
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

                    <div className="mt-5 border-t border-[#e0d8cd] pt-5">

                        <div className="flex justify-between text-sm">
                            <span className="text-[#877d72]">
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
                            <span className="text-[#877d72]">
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


                        <div className="mt-4 flex justify-between border-t border-[#e0d8cd] pt-4">

                            <span className="font-bold text-[#24211d]">
                                Total
                            </span>

                            <span className="text-xl font-bold text-[#24211d]">
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

                <section className="mt-6 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                    <h2 className="text-base font-bold text-[#24211d]">
                        Delivery Address
                    </h2>


                    <div className="mt-4 rounded-xl bg-[#eee8de] p-5">

                        <p className="text-sm font-bold text-[#24211d]">
                            {
                                order.deliveryAddress
                                    ?.name
                            }
                        </p>

                        <p className="mt-2 text-xs leading-6 text-[#746b61]">

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

                        <p className="mt-2 text-xs font-medium text-[#5d554c]">
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
                    <section className="mt-6 rounded-xl border border-red-100 bg-red-50 p-6">

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
                            className="mt-4 rounded-xl border border-red-200 bg-[#f8f4ec] px-5 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
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