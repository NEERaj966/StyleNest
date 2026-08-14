import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import useThrottle from "../hooks/useThrottle";

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
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        💳
                    </div>

                    <h1 className="mt-5 text-xl font-bold text-slate-900">
                        Payment Order Not Found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        We could not find the order that
                        needs payment.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/products")
                        }
                        className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="mx-auto max-w-xl">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            StyleNest Payment
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-slate-900">
                            Complete Payment
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Complete your payment securely
                            using Razorpay.
                        </p>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Order
                            </span>

                            <span className="text-sm font-bold text-slate-800">
                                #{order._id.slice(-8)}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-500">
                                Customer
                            </span>

                            <span className="truncate text-right text-sm font-semibold text-slate-800">
                                {order.customerName}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Payment
                            </span>

                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                                {paymentMode}
                            </span>
                        </div>

                        <div className="mt-5 border-t border-slate-200 pt-5">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700">
                                    Total
                                </span>

                                <span className="text-2xl font-bold text-slate-900">
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
                        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing
                            ? "Opening Payment..."
                            : `Pay ₹${Number(
                                order.total
                            ).toLocaleString(
                                "en-IN"
                            )}`}
                    </button>

                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-lg">
                            🔒
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Secure Payment
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                You will be redirected to
                                Razorpay Checkout where
                                you can complete your
                                payment securely.
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Secure payment powered by Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;