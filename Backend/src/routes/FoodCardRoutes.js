import { Router } from "express";
import {
    createFoodCard,
    getFoodCards,
    getFoodCardById,
    getMyFoodCards,
    updateFoodCard,
    deleteFoodCard,
    updateFoodCardRating,
    addFoodCardReview,
    getFoodCardReviews
} from "../Controllers/FoodCard.controller.js";
import { verifyJWTForAdmin, verifyJWTForUser } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/upload.middleware.js";

const router = Router();

router.route("/")
    .get(getFoodCards)
    .post(verifyJWTForAdmin, upload.array("images", 4), createFoodCard);

router.route("/my")
    .get(verifyJWTForAdmin, getMyFoodCards);

router.route("/:id")
    .put(verifyJWTForAdmin, upload.array("images", 2), updateFoodCard)
    .delete(verifyJWTForAdmin, deleteFoodCard);

router.route("/:id/rating")
    .patch(updateFoodCardRating);

router.route("/:id/reviews")
    .get(getFoodCardReviews)
    .post(verifyJWTForUser, addFoodCardReview);

router.route("/:id").get(getFoodCardById);

export default router;
