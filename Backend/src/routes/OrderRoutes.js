import { Router } from "express";

import {
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    verifyPayment,
    createRazorpayOrder,

    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    updatePaymentStatus,
} from "../Controllers/Order.controller.js";

import {
    verifyJWTForUser,
} from "../Middleware/auth.middleware.js";

import {
    verifyJWTForAdmin,
} from "../Middleware/auth.middleware.js";

const router = Router();


// ======================================================
// USER
// ======================================================

router.route("/").post(
    verifyJWTForUser,
    createOrder
);

router.route("/my").get(
    verifyJWTForUser,
    getMyOrders
);

router.route("/my/:id").get(
    verifyJWTForUser,
    getMyOrderById
);

router.route("/my/:id/cancel").patch(
    verifyJWTForUser,
    cancelMyOrder
);


router.route("/verify-payment")
    .post(
        verifyJWTForUser,
        verifyPayment
    );

router.route("/razorpay/create").post(
    verifyJWTForUser,
    createRazorpayOrder
);

// ======================================================
// ADMIN
// ======================================================

router.route("/admin").get(
    verifyJWTForAdmin,
    getAllOrders
);

router.route("/admin/:id").get(
    verifyJWTForAdmin,
    getAdminOrderById
);

router.route("/admin/:id/status").patch(
    verifyJWTForAdmin,
    updateOrderStatus
);

router.route("/admin/:id/payment").patch(
    verifyJWTForAdmin,
    updatePaymentStatus
);


export default router;
