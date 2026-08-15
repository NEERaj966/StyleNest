import mongoose from "mongoose";
import crypto from "crypto";

import razorpay from "../config/razorpay.js";


import { Order } from "../models/Order.model.js";
import { Address } from "../models/Address.model.js";
import { FoodCard } from "../Models/foodcard.model.js";





// ============================================================
// CREATE ORDER + RAZORPAY ORDER
// ============================================================

export const createOrder = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }

        const {
            productId,
            quantity,
            addressId,
            paymentMethod = "online",
            onlineMode = "",
            size = "",
        } = req.body;

        // ====================================================
        // VALIDATION
        // ====================================================
        if (paymentMethod !== "online") {
            return res.status(400).json({
                success: false,
                message: "Only online payment is supported",
            });
        }

        if (!["upi", "card"].includes(onlineMode)) {
            return res.status(400).json({
                success: false,
                message: "Payment mode must be UPI or Card",
            });
        }


        if (!productId || !quantity || !addressId) {
            return res.status(400).json({
                success: false,
                message:
                    "productId, quantity and addressId are required",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(addressId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or address ID",
            });
        }

        const qty = Number(quantity);

        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer",
            });
        }

        // ====================================================
        // PAYMENT MODE
        // ====================================================

        let normalizedOnlineMode = String(
            onlineMode || ""
        )
            .trim()
            .toLowerCase();

        if (
            normalizedOnlineMode !== "" &&
            !["upi", "card"].includes(
                normalizedOnlineMode
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "onlineMode must be upi or card",
            });
        }

        // ====================================================
        // ADDRESS
        // ====================================================

        const address = await Address.findOne({
            _id: addressId,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message:
                    "Delivery address not found",
            });
        }

        // ====================================================
        // PRODUCT
        // ====================================================

        const product =
            await FoodCard.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // ====================================================
        // STOCK
        // ====================================================

        const availableQuantity =
            Number(product.quantity || 0);

        if (
            product.isAvailable === false ||
            availableQuantity < qty
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Requested quantity is not available",
                data: {
                    availableQuantity,
                },
            });
        }

        const normalizedSize = String(size || "").trim();
        const productSizes = Array.isArray(product.sizes)
            ? product.sizes
            : [];

        if (productSizes.length > 0) {
            if (!normalizedSize) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a size",
                });
            }

            if (!productSizes.includes(normalizedSize)) {
                return res.status(400).json({
                    success: false,
                    message: "Selected size is not available",
                });
            }
        }

        // ====================================================
        // PRICE
        // ====================================================

        const unitPrice =
            Number(product.price || 0);

        const lineTotal =
            unitPrice * qty;

        const subtotal = lineTotal;

        const tax = 0;

        const total = subtotal + tax;

        if (total <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Order amount must be greater than zero",
            });
        }

        // ====================================================
        // ADDRESS SNAPSHOT
        // ====================================================

        const deliveryAddress = {
            name: address.name,

            phone: address.phone,

            addressLine1:
                address.addressLine1,

            addressLine2:
                address.addressLine2 || "",

            city: address.city,

            state: address.state,

            pincode: address.pincode,

            landmark:
                address.landmark || "",

            type:
                address.type || "Home",
        };

        // ====================================================
        // CREATE MONGODB ORDER
        // ====================================================

        const order = await Order.create({
            user: userId,

            customerName: address.name,

            customerPhone: address.phone,

            deliveryAddress,

            items: [
                {
                    foodCard: product._id,
                    name: product.name,
                    category: product.category || "Other",
                    size: normalizedSize,
                    unitPrice,
                    quantity: qty,
                    lineTotal,
                },
            ],

            paymentMethod: "online",

            onlineMode,

            paidOnline: false,

            paymentProvider: "razorpay",

            paymentStatus: "pending",

            subtotal,

            tax,

            total,

            status: "Placed",

            statusTimeline: [
                {
                    status: "Placed",
                    note: "Order created and awaiting payment",
                    by: "system",
                    at: new Date(),
                },
            ],
        });

        // ====================================================
        // CREATE RAZORPAY ORDER
        // ====================================================

        const razorpayOrder =
            await razorpay.orders.create({
                amount:
                    Math.round(total * 100),

                currency: "INR",

                receipt:
                    `order_${order._id}`,

                notes: {
                    mongoOrderId:
                        order._id.toString(),

                    userId:
                        userId.toString(),

                    productId:
                        product._id.toString(),
                },

                partial_payment: false,

                payment_capture: 1,
            });

        // ====================================================
        // SAVE RAZORPAY ORDER ID
        // ====================================================

        order.razorpayOrderId =
            razorpayOrder.id;

        await order.save();

        // ====================================================
        // RESPONSE
        // ====================================================

        return res.status(201).json({
            success: true,

            message:
                "Order created successfully",

            data: {
                orderId:
                    order._id,

                razorpayOrderId:
                    razorpayOrder.id,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,

                key:
                    process.env.RAZORPAY_KEY_ID,

                order,
            },
        });

    } catch (error) {

        console.error(
            "Create order error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to create order",

            error:
                error.message,
        });
    }
};


// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

export const verifyPayment = async (req, res) => {

    try {

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User authentication required",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // ====================================================
        // VALIDATION
        // ====================================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment verification data is incomplete",
            });
        }

        // ====================================================
        // FIND OUR DATABASE ORDER
        // ====================================================

        const order =
            await Order.findOne({
                razorpayOrderId:
                    razorpay_order_id,

                user: userId,
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        // ====================================================
        // PREVENT DOUBLE PAYMENT
        // ====================================================

        if (
            order.paymentStatus === "paid"
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Payment already verified",

                data: {
                    order,
                },
            });
        }

        // ====================================================
        // CREATE SIGNATURE
        // ====================================================

        const body =
            `${order.razorpayOrderId}|${razorpay_payment_id}`;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");

        

        // ====================================================
        // TIMING SAFE COMPARISON
        // ====================================================

        const isValid =
            expectedSignature.length ===
            razorpay_signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(
                    expectedSignature
                ),
                Buffer.from(
                    razorpay_signature
                )
            );

        if (!isValid) {

            order.paymentStatus =
                "failed";

            await order.save();

            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment signature",
            });
        }

        // ====================================================
        // FIND PRODUCTS
        // ====================================================

        for (const item of order.items) {

            const product =
                await FoodCard.findById(
                    item.foodCard
                );

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        `Product ${item.name} no longer exists`,
                });
            }

            if (
                product.isAvailable === false ||
                Number(product.quantity || 0) <
                item.quantity
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Insufficient stock for ${item.name}`,
                });
            }
        }

        // ====================================================
        // REDUCE STOCK
        // ====================================================

        for (const item of order.items) {

            const product =
                await FoodCard.findById(
                    item.foodCard
                );

            product.quantity =
                Number(product.quantity) -
                item.quantity;

            if (
                product.quantity <= 0
            ) {

                product.quantity = 0;

                product.isAvailable =
                    false;
            }

            await product.save();
        }

        // ====================================================
        // UPDATE PAYMENT
        // ====================================================

        order.paymentStatus =
            "paid";

        order.paidOnline =
            true;

        order.paymentProvider =
            "razorpay";

        order.razorpayPaymentId =
            razorpay_payment_id;

        order.razorpaySignature =
            razorpay_signature;

        

        // ====================================================
        // STATUS TIMELINE
        // ====================================================

        order.statusTimeline.push({
            status: "Placed",

            note:
                "Payment verified successfully",

            by: "system",

            at: new Date(),
        });

        await order.save();

        // ====================================================
        // RESPONSE
        // ====================================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            data: {
                order,
            },
        });

    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Payment verification failed",
            error:
                error.message,
        });
    }
};



// ======================================================
// GET USER ORDERS
// ======================================================

export const getMyOrders = async (
    req,
    res
) => {
    try {
        const userId = req.user?._id;

        const orders =
            await Order.find({
                user: userId,
            })
                .populate(
                    "items.foodCard",
                    "name imageUrl images"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",

            data: {
                orders,
            },
        });

    } catch (error) {
        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch orders",
        });
    }
};



// ======================================================
// GET USER ORDER BY ID
// ======================================================

export const getMyOrderById = async (
    req,
    res
) => {
    try {
        const userId = req.user?._id;

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }


        const order =
            await Order.findOne({
                _id: id,
                user: userId,
            }).populate(
                "items.foodCard",
                "name imageUrl images"
            );


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }


        return res.status(200).json({
            success: true,

            data: {
                order,
            },
        });

    } catch (error) {
        console.error(
            "Get order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order",
        });
    }
};



// ======================================================
// CANCEL USER ORDER
// ======================================================

export const cancelMyOrder = async (
    req,
    res
) => {
    try {
        const userId = req.user?._id;

        const { id } = req.params;


        const order =
            await Order.findOne({
                _id: id,
                user: userId,
            });


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }


        // ==================================================
        // CANCELLATION CONDITIONS
        // ==================================================

        if (
            order.status === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order is already cancelled",
            });
        }


        if (
            order.status !== "Placed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order can only be cancelled before preparation starts",
            });
        }


        // ==================================================
        // CANCEL
        // ==================================================

        order.status = "Cancelled";


        order.statusTimeline.push({
            status: "Cancelled",

            note:
                "Order cancelled by customer",

            by: "user",

            at: new Date(),
        });


        // ==================================================
        // REFUND STATE
        // ==================================================

        if (
            order.paymentStatus === "paid"
        ) {
            order.paymentStatus =
                "refunded";
        }


        // ==================================================
        // RESTORE STOCK
        // ==================================================

        for (
            const item of order.items
        ) {
            const product =
                await FoodCard.findById(
                    item.foodCard
                );


            if (product) {
                product.quantity =
                    Number(product.quantity) +
                    Number(item.quantity);

                product.isAvailable = true;

                await product.save();
            }
        }


        await order.save();


        return res.status(200).json({
            success: true,

            message:
                "Order cancelled successfully",

            data: {
                order,
            },
        });

    } catch (error) {
        console.error(
            "Cancel order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel order",
        });
    }
};



// ======================================================
// ADMIN - GET ALL ORDERS
// ======================================================

export const getAllOrders = async (
    req,
    res
) => {
    try {
        const orders =
            await Order.find()
                .populate(
                    "user",
                    "name email phone"
                )
                .populate(
                    "items.foodCard",
                    "name imageUrl images"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({
            success: true,

            data: {
                orders,
            },
        });

    } catch (error) {
        console.error(
            "Get all orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch orders",
        });
    }
};



// ======================================================
// ADMIN - GET ORDER
// ======================================================

export const getAdminOrderById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;


        const order =
            await Order.findById(id)
                .populate(
                    "user",
                    "name email phone"
                )
                .populate(
                    "items.foodCard",
                    "name imageUrl images"
                );


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }


        return res.status(200).json({
            success: true,

            data: {
                order,
            },
        });

    } catch (error) {
        console.error(
            "Admin get order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order",
        });
    }
};



// ======================================================
// ADMIN - UPDATE STATUS
// ======================================================

export const updateOrderStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            status,
            note = "",
        } = req.body;


        const allowedStatuses = [
            "Placed",
            "Preparing",
            "Ready",
            "Delivered",
            "Cancelled",
        ];


        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status",
            });
        }


        const order =
            await Order.findById(id);


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }


        if (
            order.status === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cancelled order cannot be updated",
            });
        }


        order.status = status;


        order.statusTimeline.push({
            status,

            note,

            by: "admin",

            at: new Date(),
        });


        if (
            status === "Delivered"
        ) {
            order.etaMinutes = 0;
            order.etaAt = null;
        }


        await order.save();


        return res.status(200).json({
            success: true,

            message:
                "Order status updated successfully",

            data: {
                order,
            },
        });

    } catch (error) {
        console.error(
            "Update order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update order status",
        });
    }
};



// ======================================================
// ADMIN - UPDATE PAYMENT
// ======================================================

export const updatePaymentStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            paymentStatus,
        } = req.body;


        const allowed = [
            "pending",
            "paid",
            "failed",
            "refunded",
        ];


        if (
            !allowed.includes(
                paymentStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment status",
            });
        }


        const order =
            await Order.findById(id);


        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }


        order.paymentStatus =
            paymentStatus;

        order.paidOnline =
            paymentStatus === "paid";


        await order.save();


        return res.status(200).json({
            success: true,

            message:
                "Payment status updated",

            data: {
                order,
            },
        });

    } catch (error) {
        console.error(
            "Update payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update payment status",
        });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user?._id;

        const { orderId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order is already paid",
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.total * 100),
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                orderId: order._id.toString(),
                userId: userId.toString(),
            },
        });

        order.razorpayOrderId = razorpayOrder.id;
        order.paymentProvider = "razorpay";
        order.paymentStatus = "pending";

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                razorpayOrder,
                order,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });

    } catch (error) {
        console.error(
            "Create Razorpay order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order",
            error: error.message,
        });
    }
};
