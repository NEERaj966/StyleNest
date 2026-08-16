import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import useThrottle from "../Hooks/useThrottle";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const order = location.state?.order;

    const paymentMode =
        location.state?.paymentMode || "upi";

    const [processing, setProcessing] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.async = true;

            script.onload = () => {
                resolve(!!window.Razorpay);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);

            setTimeout(() => {
                if (!window.Razorpay) {
                    resolve(false);
                }
            }, 10000);
        });
    };

    const verifyPayment = async (razorpayResponse) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert(
                    "Your login session has expired. Please login again."
                );

                navigate("/login");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/v1/orders/verify-payment`,
                {
                    razorpay_order_id:
                        razorpayResponse.razorpay_order_id,

                    razorpay_payment_id:
                        razorpayResponse.razorpay_payment_id,

                    razorpay_signature:
                        razorpayResponse.razorpay_signature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Payment verification failed."
                );
            }

            setProcessing(false);

            alert(
                "Payment successful! Your order has been placed."
            );

            navigate("/myorders", {
                replace: true,
                state: {
                    paymentSuccess: true,
                    orderId: order._id,
                },
            });
        } catch (error) {
            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Payment verification failed."
            );

            setProcessing(false);
        }
    };

    const startPayment = async () => {
        try {
            if (processing) {
                return;
            }

            setProcessing(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login to continue.");

                navigate("/login");

                setProcessing(false);

                return;
            }

            const loaded = await loadRazorpay();

            if (!loaded || !window.Razorpay) {
                throw new Error(
                    "Razorpay SDK could not be loaded."
                );
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/v1/orders/razorpay/create`,
                {
                    orderId: order._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 15000,
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Failed to create Razorpay order."
                );
            }

            const paymentData = response.data?.data;

            if (!paymentData) {
                throw new Error(
                    "Backend did not return payment data."
                );
            }

            const keyId = paymentData.keyId;
            const razorpayOrder =
                paymentData.razorpayOrder;

            if (!keyId) {
                throw new Error(
                    "Razorpay Key ID is missing from backend."
                );
            }

            if (!razorpayOrder?.id) {
                throw new Error(
                    "Razorpay Order ID is missing from backend."
                );
            }

            if (!razorpayOrder?.amount) {
                throw new Error(
                    "Razorpay amount is missing."
                );
            }

            const options = {
                key: keyId,

                amount: razorpayOrder.amount,

                currency:
                    razorpayOrder.currency || "INR",

                name: "StyleNest",

                description:
                    `Payment for Order #${order._id.slice(-8)}`,

                order_id: razorpayOrder.id,

                prefill: {
                    name:
                        order.customerName || "",

                    contact:
                        order.customerPhone || "",
                },

                notes: {
                    orderId: order._id,
                },

                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true,
                },

                theme: {
                    color: "#0f172a",
                },

                handler: async (razorpayResponse) => {
                    await verifyPayment(
                        razorpayResponse
                    );
                },

                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                    },
                },
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                (response) => {
                    alert(
                        response?.error?.description ||
                        "Payment failed."
                    );

                    setProcessing(false);
                }
            );

            razorpay.open();
        } catch (error) {
            let message =
                "Unable to start payment.";

            if (error?.code === "ECONNABORTED") {
                message =
                    "Payment server is taking too long to respond.";
            } else if (
                error?.response?.data?.message
            ) {
                message =
                    error.response.data.message;
            } else if (error?.message) {
                message = error.message;
            }

            alert(message);

            setProcessing(false);
        }
    };

    const throttledStartPayment = useThrottle(
        startPayment,
        2000
    );

    if (!order) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#eee8de] px-4">
                <div className="w-full max-w-md rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-8 text-center shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#e5ded3] text-2xl">
                        💳
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-[#24211d]">
                        Payment Order Not Found
                    </h1>

                    <p className="mt-2 text-sm text-[#746b61]">
                        We could not find the order that
                        needs payment.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/products")
                        }
                        className="mt-6 w-full rounded-xl bg-[#24211d] px-5 py-3 text-sm font-bold text-[#f8f4ec] transition hover:bg-[#302b26]"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eee8de] px-4 py-8">
            <div className="mx-auto max-w-xl">
                <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-6 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#877d72]">
                            StyleNest Payment
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-[#24211d]">
                            Complete Payment
                        </h1>

                        <p className="mt-2 text-sm text-[#746b61]">
                            Complete your payment securely
                            using Razorpay.
                        </p>
                    </div>

                    <div className="mt-6 rounded-xl bg-[#eee8de] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[#746b61]">
                                Order
                            </span>

                            <span className="text-sm font-bold text-[#302b26]">
                                #{order._id.slice(-8)}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-sm text-[#746b61]">
                                Customer
                            </span>

                            <span className="truncate text-right text-sm font-semibold text-[#302b26]">
                                {order.customerName}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-[#746b61]">
                                Payment
                            </span>

                            <span className="rounded-full bg-[#d9d0c4] px-3 py-1 text-xs font-bold uppercase text-[#3e3730]">
                                {paymentMode}
                            </span>
                        </div>

                        <div className="mt-5 border-t border-[#d5cec2] pt-5">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[#3e3730]">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-[#24211d]">
                                    ₹
                                    {Number(
                                        order.total
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={throttledStartPayment}
                        disabled={processing}
                        className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-[#24211d] text-sm font-bold text-[#f8f4ec] transition hover:bg-[#302b26] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing
                            ? "Opening Payment..."
                            : `Pay ₹${Number(
                                order.total
                            ).toLocaleString(
                                "en-IN"
                            )}`}
                    </button>

                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-4">
                        <div className="text-lg">
                            🔒
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#302b26]">
                                Secure Payment
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#746b61]">
                                You will be redirected to
                                Razorpay Checkout where
                                you can complete your
                                payment securely.
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs text-[#877d72]">
                        Secure payment powered by Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
