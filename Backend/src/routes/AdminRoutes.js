import { Router } from "express";
import {  loginAdmin, logoutAdmin, getAdminProfile } from '../Controllers/Admin.controller.js'
import { verifyJWTForAdmin } from '../Middleware/auth.middleware.js'

const router = Router();

router.route("/login").post(loginAdmin);
router.route("/logout").get(verifyJWTForAdmin, logoutAdmin);
router.route("/profile").get(verifyJWTForAdmin, getAdminProfile);



export default router
