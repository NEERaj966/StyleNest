import mongoose from "mongoose";
import { Order } from "../Models/order.model.js";

// =========================================================
// GET ALL ORDERS - ADMIN
// GET /api/v1/admin/orders
// =========================================================

export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "All",
            paymentStatus = "All",
            sort = "newest",
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const perPage = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const skip =
            (currentPage - 1) * perPage;

        const query = {};

        // =====================================================
        // STATUS FILTER
        // =====================================================

        if (
            status &&
            status !== "All"
        ) {
            query.status = status;
        }

        // =====================================================
        // PAYMENT STATUS FILTER
        // =====================================================

        if (
            paymentStatus &&
            paymentStatus !== "All"
        ) {
            query.paymentStatus =
                paymentStatus;
        }

        // =====================================================
        // SEARCH
        // =====================================================

        if (search.trim()) {
            const searchText =
                search.trim();

            const searchConditions = [
                {
                    "customerName":
                    {
                        $regex:
                            searchText,
                        $options:
                            "i",
                    },
                },
                {
                    "customerPhone":
                    {
                        $regex:
                            searchText,
                        $options:
                            "i",
                    },
                },
                {
                    "customerEmail":
                    {
                        $regex:
                            searchText,
                        $options:
                            "i",
                    },
                }
            ];

            // Search by MongoDB ObjectId
            if (
                mongoose.Types.ObjectId.isValid(
                    searchText
                )
            ) {
                searchConditions.push({
                    _id:
                        new mongoose.Types.ObjectId(
                            searchText
                        ),
                });
            }

            query.$or =
                searchConditions;
        }

        // =====================================================
        // SORT
        // =====================================================

        let sortOption = {
            createdAt: -1,
        };

        if (sort === "oldest") {
            sortOption = {
                createdAt: 1,
            };
        }

        if (sort === "highest") {
            sortOption = {
                total: -1,
            };
        }

        if (sort === "lowest") {
            sortOption = {
                total: 1,
            };
        }

        // =====================================================
        // FETCH
        // =====================================================

        const [
            orders,
            totalOrders,
        ] = await Promise.all([
            Order.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(perPage)
                .lean(),

            Order.countDocuments(query),
        ]);

        const totalPages =
            Math.ceil(
                totalOrders /
                perPage
            );

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({
            success: true,

            data: {
                orders,

                pagination: {
                    page: currentPage,
                    limit: perPage,
                    totalOrders,
                    totalPages,

                    hasNextPage:
                        currentPage <
                        totalPages,

                    hasPreviousPage:
                        currentPage > 1,
                },
            },

            message:
                "Orders fetched successfully.",
        });
    } catch (error) {
        console.error(
            "Admin get all orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            data: null,
            message:
                "Failed to fetch orders.",
            errors: [
                error.message,
            ],
        });
    }
};


// =========================================================
// GET SINGLE ORDER - ADMIN
// GET /api/v1/admin/orders/:id
// =========================================================

export const getAdminOrderById =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Invalid order ID.",
                    errors: [],
                });
            }

            const order =
                await Order.findById(id)
                    .lean();

            if (!order) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    message:
                        "Order not found.",
                    errors: [],
                });
            }

            return res.status(200).json({
                success: true,

                data: {
                    order,
                },

                message:
                    "Order fetched successfully.",
            });
        } catch (error) {
            console.error(
                "Admin get order error:",
                error
            );

            return res.status(500).json({
                success: false,
                data: null,
                message:
                    "Failed to fetch order.",
                errors: [
                    error.message,
                ],
            });
        }
    };


// =========================================================
// UPDATE ORDER STATUS - ADMIN
// PATCH /api/v1/admin/orders/:id/status
// =========================================================

export const updateOrderStatus =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            const {
                status,
                note = "",
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Invalid order ID.",
                    errors: [],
                });
            }

            const allowedStatuses = [
                "Placed",
                "Confirmed",
                "Preparing",
                "Ready",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ];

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Invalid order status.",
                    errors: [],
                });
            }

            const order =
                await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    message:
                        "Order not found.",
                    errors: [],
                });
            }

            const oldStatus =
                order.status;

            // =================================================
            // PREVENT CHANGING FINAL STATES
            // =================================================

            if (
                oldStatus ===
                "Cancelled"
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Cancelled orders cannot be updated.",
                    errors: [],
                });
            }

            if (
                oldStatus ===
                "Delivered"
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Delivered orders cannot be updated.",
                    errors: [],
                });
            }

            if (
                oldStatus ===
                status
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Order already has this status.",
                    errors: [],
                });
            }

            // =================================================
            // STATUS TRANSITION
            // =================================================

            const statusOrder = [
                "Placed",
                "Confirmed",
                "Preparing",
                "Ready",
                "Shipped",
                "Out for Delivery",
                "Delivered",
            ];

            if (
                status !==
                "Cancelled"
            ) {
                const oldIndex =
                    statusOrder.indexOf(
                        oldStatus
                    );

                const newIndex =
                    statusOrder.indexOf(
                        status
                    );

                // Unknown previous status
                if (
                    oldIndex === -1 ||
                    newIndex === -1
                ) {
                    return res.status(400).json({
                        success: false,
                        data: null,
                        message:
                            "Invalid status transition.",
                        errors: [],
                    });
                }

                // Do not allow moving backwards
                if (
                    newIndex <
                    oldIndex
                ) {
                    return res.status(400).json({
                        success: false,
                        data: null,
                        message:
                            `Cannot move order from ${oldStatus} back to ${status}.`,
                        errors: [],
                    });
                }
            }

            // =================================================
            // UPDATE STATUS
            // =================================================

            order.status =
                status;

            // =================================================
            // STATUS TIMELINE
            // =================================================

            if (
                !Array.isArray(
                    order.statusTimeline
                )
            ) {
                order.statusTimeline =
                    [];
            }

            order.statusTimeline.push({
                status,
                note:
                    note.trim() ||
                    `Order status changed from ${oldStatus} to ${status} by admin.`,
                at: new Date(),
            });

            // =================================================
            // CANCELLED
            // =================================================

            if (
                status ===
                "Cancelled"
            ) {
                order.cancelledAt =
                    new Date();

                order.cancelledBy =
                    "admin";
            }

            // =================================================
            // DELIVERED
            // =================================================

            if (
                status ===
                "Delivered"
            ) {
                order.deliveredAt =
                    new Date();
            }

            const updatedOrder =
                await order.save();

            return res.status(200).json({
                success: true,

                data: {
                    order:
                        updatedOrder,
                },

                message:
                    `Order status updated to ${status}.`,
            });
        } catch (error) {
            console.error(
                "Admin update order status error:",
                error
            );

            return res.status(500).json({
                success: false,
                data: null,
                message:
                    "Failed to update order status.",
                errors: [
                    error.message,
                ],
            });
        }
    };


// =========================================================
// CANCEL ORDER - ADMIN
// PATCH /api/v1/admin/orders/:id/cancel
// =========================================================

export const cancelOrderByAdmin =
    async (req, res) => {
        try {
            const { id } =
                req.params;

            const {
                note = "",
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Invalid order ID.",
                    errors: [],
                });
            }

            const order =
                await Order.findById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    message:
                        "Order not found.",
                    errors: [],
                });
            }

            if (
                order.status ===
                "Cancelled"
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Order is already cancelled.",
                    errors: [],
                });
            }

            if (
                order.status ===
                "Delivered"
            ) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    message:
                        "Delivered orders cannot be cancelled.",
                    errors: [],
                });
            }

            const previousStatus =
                order.status;

            order.status =
                "Cancelled";

            order.cancelledAt =
                new Date();

            order.cancelledBy =
                "admin";

            if (
                !Array.isArray(
                    order.statusTimeline
                )
            ) {
                order.statusTimeline =
                    [];
            }

            order.statusTimeline.push({
                status:
                    "Cancelled",

                note:
                    note.trim() ||
                    `Order cancelled by admin from ${previousStatus} status.`,

                at: new Date(),
            });

            const updatedOrder =
                await order.save();

            return res.status(200).json({
                success: true,

                data: {
                    order:
                        updatedOrder,
                },

                message:
                    "Order cancelled successfully.",
            });
        } catch (error) {
            console.error(
                "Admin cancel order error:",
                error
            );

            return res.status(500).json({
                success: false,
                data: null,
                message:
                    "Failed to cancel order.",
                errors: [
                    error.message,
                ],
            });
        }
    };
