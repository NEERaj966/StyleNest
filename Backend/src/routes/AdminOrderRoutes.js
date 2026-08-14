import express from "express";

import {
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
    cancelOrderByAdmin,
} from "../controllers/adminOrder.controller.js";

import {
    verifyJWTForAdmin,
} from "../middleware/auth.middleware.js";


const router =
    express.Router();


// =========================================================
// GET ALL ORDERS
// =========================================================

router.get(
    "/",
    verifyJWTForAdmin,
    getAllOrders
);


// =========================================================
// GET SINGLE ORDER
// =========================================================

router.get(
    "/:id",
    verifyJWTForAdmin,
    getAdminOrderById
);


// =========================================================
// UPDATE STATUS
// =========================================================

router.patch(
    "/:id/status",
    verifyJWTForAdmin,
    updateOrderStatus
);


// =========================================================
// CANCEL ORDER
// =========================================================

router.patch(
    "/:id/cancel",
    verifyJWTForAdmin,
    cancelOrderByAdmin
);


export default router;