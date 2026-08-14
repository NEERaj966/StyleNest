import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  loginWithGoogle
} from '../Controllers/User.controller.js'
import { verifyJWTForUser } from "../Middleware/auth.middleware.js";




const router = Router();

router.route("/register").post( registerUser );
router.route("/login").post( loginUser );
router.route("/google").post( loginWithGoogle );
router.route("/logout").get( verifyJWTForUser , logoutUser );
router.route("/userProfile").get( verifyJWTForUser , getUserProfile );
router.route("/favorites").get( verifyJWTForUser , getFavorites );
router.route("/favorites/:foodCardId").post( verifyJWTForUser , addFavorite );
router.route("/favorites/:foodCardId").delete( verifyJWTForUser , removeFavorite );





export default router
