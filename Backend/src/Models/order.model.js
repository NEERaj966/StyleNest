import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine2: {
            type: String,
            default: "",
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        landmark: {
            type: String,
            default: "",
            trim: true,
        },

        type: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
        },
    },
    { _id: false }
);


const orderItemSchema = new mongoose.Schema(
    {
        foodCard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoodCard",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            default: "Other",
            trim: true,
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true,
        },

        deliveryAddress: {
            type: deliveryAddressSchema,
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,

            validate: {
                validator: (value) =>
                    Array.isArray(value) &&
                    value.length > 0,

                message:
                    "At least one order item is required",
            },
        },

        paymentMethod: {
            type: String,
            enum: ["online"],
            default: "online",
        },

        onlineMode: {
            type: String,
            enum: ["upi", "card", ""],
            default: "",
        },

        paidOnline: {
            type: Boolean,
            default: false,
        },

        paymentProvider: {
            type: String,
            enum: ["manual", "razorpay"],
            default: "razorpay",
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "pending",
        },

        razorpayOrderId: {
            type: String,
            default: "",
        },

        razorpayPaymentId: {
            type: String,
            default: "",
        },

        razorpaySignature: {
            type: String,
            default: "",
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        tax: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "Placed",
                "Confirmed",
                "Preparing",
                "Ready",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Placed",
        },

        statusTimeline: {
            type: [
                {
                    status: {
                        type: String,
                        enum: [
                            "Placed",
                            "Confirmed",
                            "Preparing",
                            "Ready",
                            "Shipped",
                            "Out for Delivery",
                            "Delivered",
                            "Cancelled",
                        ],
                        required: true,
                    },

                    at: {
                        type: Date,
                        default: Date.now,
                    },

                    note: {
                        type: String,
                        default: "",
                        trim: true,
                    },

                    by: {
                        type: String,
                        enum: [
                            "system",
                            "admin",
                            "user",
                        ],
                        default: "system",
                    },
                },
            ],

            default: [],
        },

        etaMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },

        etaAt: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);


export const Order = mongoose.model(
    "Order",
    orderSchema
);