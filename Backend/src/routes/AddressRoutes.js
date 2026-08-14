import { Router } from "express";

import { verifyJWTForUser } from "../Middleware/auth.middleware.js";

import {
    getAddresses,
    getDefaultAddress,
    getAddressById,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
} from "../controllers/Address.controller.js";

const router = Router();

// All address routes require a logged-in user
router.route("/")
    .get(verifyJWTForUser, getAddresses)
    .post(verifyJWTForUser, createAddress);

// Default address
router.route("/default")
    .get(verifyJWTForUser, getDefaultAddress);

// Individual address
router.route("/:id")
    .get(verifyJWTForUser, getAddressById)
    .put(verifyJWTForUser, updateAddress)
    .delete(verifyJWTForUser, deleteAddress);

// Set default
router.route("/:id/default")
    .patch(verifyJWTForUser, setDefaultAddress);

export default router;