import mongoose from "mongoose";
import { FoodCard } from "../Models/foodcard.model.js";
import { StockLog } from "../Models/StockLog.model.js";
import { asyncHandler } from "../utills/AsyncHanddler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { uploadOnCloudinary } from "../utills/cloudinary.js";


// ============================================================
// CREATE FOOD CARD
// ============================================================

const createFoodCard = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        quantity,
        category,
        description,
        imageUrl,
        isAvailable,
        rating,
    } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Item name is required");
    }

    if (
        price === undefined ||
        price === null ||
        Number.isNaN(Number(price))
    ) {
        throw new ApiError(400, "Valid price is required");
    }

    let parsedQuantity = 0;

    if (
        quantity !== undefined &&
        quantity !== null &&
        quantity !== ""
    ) {
        const numericQuantity = Number(quantity);

        if (
            Number.isNaN(numericQuantity) ||
            numericQuantity < 0
        ) {
            throw new ApiError(
                400,
                "Quantity must be 0 or more"
            );
        }

        parsedQuantity = numericQuantity;
    }

    let uploadedImageUrl = imageUrl;
    let uploadedImages = [];

    let parsedRating = rating;

    if (rating !== undefined) {
        const numericRating = Number(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 0 ||
            numericRating > 5
        ) {
            throw new ApiError(
                400,
                "Rating must be between 0 and 5"
            );
        }

        parsedRating = numericRating;
    }


    // ========================================================
    // MULTIPLE IMAGE UPLOAD
    // Maximum 2 images
    // ========================================================

    if (req.files && req.files.length > 0) {

        if (req.files.length > 2) {
            throw new ApiError(
                400,
                "Maximum 2 images are allowed"
            );
        }

        try {

            for (const file of req.files) {

                if (!file?.path) {
                    continue;
                }

                const uploaded =
                    await uploadOnCloudinary(file.path);

                if (!uploaded) {
                    throw new ApiError(
                        500,
                        "Image upload failed"
                    );
                }

                const uploadedUrl =
                    uploaded?.secure_url ||
                    uploaded?.url;

                if (uploadedUrl) {
                    uploadedImages.push(uploadedUrl);
                }
            }

            // First image remains the primary image
            if (uploadedImages.length > 0) {
                uploadedImageUrl = uploadedImages[0];
            }

        } catch (error) {

            throw new ApiError(
                500,
                `Image upload failed: ${
                    error.message || "Unknown error"
                }`
            );
        }
    }


    // ========================================================
    // CREATE FOOD CARD
    // ========================================================

    const foodCard = await FoodCard.create({
        name: name.trim(),
        price: Number(price),
        quantity: parsedQuantity,
        category,
        description,

        // Existing primary image
        imageUrl: uploadedImageUrl,

        // NEW: multiple images
        images: uploadedImages,

        rating: parsedRating,

        isAvailable:
            isAvailable !== undefined
                ? isAvailable
                : parsedQuantity > 0,

        admin: req.admin?._id,
    });


    // ========================================================
    // STOCK LOG
    // ========================================================

    if (Number(foodCard.quantity || 0) > 0) {

        await StockLog.create({
            foodCard: foodCard._id,
            delta: Number(foodCard.quantity || 0),
            quantityBefore: 0,
            quantityAfter: Number(foodCard.quantity || 0),
            changeType: "admin_create",
            reason: "Initial stock",
            admin: req.admin?._id,
        });

    }


    return res.status(201).json(
        new ApiResponse(
            200,
            foodCard,
            "Menu item created"
        )
    );
});


// ============================================================
// GET FOOD CARDS
// ============================================================

const getFoodCards = asyncHandler(async (req, res) => {

    // Pagination
    const page = Math.max(
        Number(req.query.page) || 1,
        1
    );

    const limit = Math.min(
        Number(req.query.limit) || 12,
        50
    );

    const skip = (page - 1) * limit;


    // ----------------------------------------
    // FILTER
    // ----------------------------------------

    const filter = {
        isAvailable: true,
    };


    // Category filter
    // Example:
    // ?category=Women
    // ?category=Men
    // ?category=Kids

    if (req.query.category) {
        filter.category = req.query.category;
    }


    // ----------------------------------------
    // GET PRODUCTS + TOTAL COUNT
    // ----------------------------------------

    const [items, total] = await Promise.all([

        FoodCard.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        FoodCard.countDocuments(filter),

    ]);


    // ----------------------------------------
    // HAS MORE
    // ----------------------------------------

    const hasMore =
        skip + items.length < total;


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items,

                pagination: {
                    page,
                    limit,
                    total,
                    hasMore,
                },
            },

            "Products fetched successfully"
        )
    );
});


// ============================================================
// GET MY FOOD CARDS
// ============================================================

const getMyFoodCards = asyncHandler(async (req, res) => {

    const page = Math.max(
        Number(req.query.page) || 1,
        1
    );

    const limit = Math.min(
        Number(req.query.limit) || 12,
        50
    );

    const skip = (page - 1) * limit;


    const filter = {
        admin: req.admin?._id,
    };


    const [items, total] = await Promise.all([

        FoodCard.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        FoodCard.countDocuments(filter),

    ]);


    const hasMore =
        skip + items.length < total;


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items,

                pagination: {
                    page,
                    limit,
                    total,
                    hasMore,
                },
            },

            "Admin menu items fetched"
        )
    );
});


// ============================================================
// UPDATE FOOD CARD
// ============================================================

const updateFoodCard = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        name,
        price,
        quantity,
        category,
        description,
        imageUrl,
        isAvailable,
        rating,
    } = req.body;


    const existing =
        await FoodCard.findById(id);


    if (!existing) {
        throw new ApiError(
            404,
            "Menu item not found"
        );
    }


    if (
        existing.admin?.toString() !==
        req.admin?._id?.toString()
    ) {
        throw new ApiError(
            403,
            "You are not allowed to update this item"
        );
    }


    const updates = {};


    if (name !== undefined) {
        updates.name = name.trim();
    }


    if (price !== undefined) {
        updates.price = Number(price);
    }


    if (quantity !== undefined) {

        const numericQuantity =
            Number(quantity);

        if (
            Number.isNaN(numericQuantity) ||
            numericQuantity < 0
        ) {
            throw new ApiError(
                400,
                "Quantity must be 0 or more"
            );
        }

        updates.quantity = numericQuantity;

        if (isAvailable === undefined) {
            updates.isAvailable =
                numericQuantity > 0;
        }
    }


    if (category !== undefined) {
        updates.category = category;
    }


    if (description !== undefined) {
        updates.description = description;
    }


    if (imageUrl !== undefined) {
        updates.imageUrl = imageUrl;
    }


    if (isAvailable !== undefined) {
        updates.isAvailable = isAvailable;
    }


    if (rating !== undefined) {

        const numericRating =
            Number(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 0 ||
            numericRating > 5
        ) {
            throw new ApiError(
                400,
                "Rating must be between 0 and 5"
            );
        }

        updates.rating = numericRating;
    }


    // ========================================================
    // MULTIPLE IMAGE UPLOAD
    // Maximum 2 images
    // ========================================================

    if (req.files && req.files.length > 0) {

        if (req.files.length > 2) {
            throw new ApiError(
                400,
                "Maximum 2 images are allowed"
            );
        }

        try {

            const uploadedImages = [];

            for (const file of req.files) {

                if (!file?.path) {
                    continue;
                }

                const uploaded =
                    await uploadOnCloudinary(file.path);

                if (!uploaded) {
                    throw new ApiError(
                        500,
                        "Image upload failed"
                    );
                }

                const uploadedUrl =
                    uploaded?.secure_url ||
                    uploaded?.url;

                if (uploadedUrl) {
                    uploadedImages.push(uploadedUrl);
                }
            }


            if (uploadedImages.length > 0) {

                // Store both images
                updates.images =
                    uploadedImages;

                // First image remains primary
                updates.imageUrl =
                    uploadedImages[0];
            }

        } catch (error) {

            throw new ApiError(
                500,
                `Image upload failed: ${
                    error.message ||
                    "Unknown error"
                }`
            );
        }
    }


    // ========================================================
    // UPDATE
    // ========================================================

    const updated =
        await FoodCard.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true,
            }
        );


    // ========================================================
    // STOCK LOG
    // ========================================================

    if (
        updates.quantity !== undefined &&
        updated
    ) {

        const before =
            Number(existing.quantity ?? 0);

        const after =
            Number(updated.quantity ?? 0);

        const delta =
            after - before;


        if (delta !== 0) {

            await StockLog.create({

                foodCard: updated._id,

                delta,

                quantityBefore:
                    before,

                quantityAfter:
                    after,

                changeType:
                    "manual_update",

                reason:
                    "Admin stock update",

                admin:
                    req.admin?._id,
            });
        }
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            updated,
            "Menu item updated"
        )
    );
});


// ============================================================
// DELETE FOOD CARD
// ============================================================

const deleteFoodCard = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const existing =
        await FoodCard.findById(id);


    if (!existing) {
        throw new ApiError(
            404,
            "Menu item not found"
        );
    }


    if (
        existing.admin?.toString() !==
        req.admin?._id?.toString()
    ) {
        throw new ApiError(
            403,
            "You are not allowed to delete this item"
        );
    }


    await FoodCard.findByIdAndDelete(id);


    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Menu item deleted"
        )
    );
});


// ============================================================
// UPDATE FOOD CARD RATING
// ============================================================

const updateFoodCardRating = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { rating } = req.body;


    const numericRating =
        Number(rating);


    if (
        Number.isNaN(numericRating) ||
        numericRating < 0 ||
        numericRating > 5
    ) {
        throw new ApiError(
            400,
            "Rating must be between 0 and 5"
        );
    }


    const updated =
        await FoodCard.findByIdAndUpdate(
            id,
            {
                rating: numericRating,
            },
            {
                new: true,
            }
        );


    if (!updated) {
        throw new ApiError(
            404,
            "Menu item not found"
        );
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            updated,
            "Rating updated"
        )
    );
});


// ============================================================
// ADD FOOD CARD REVIEW
// ============================================================

const addFoodCardReview = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        rating,
        comment = "",
    } = req.body;


    const numericRating =
        Number(rating);


    if (
        Number.isNaN(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        throw new ApiError(
            400,
            "Rating must be between 1 and 5"
        );
    }


    const foodCard =
        await FoodCard.findById(id);


    if (!foodCard) {
        throw new ApiError(
            404,
            "Menu item not found"
        );
    }


    const userId =
        req.user?._id;


    const existingIndex =
        foodCard.reviews.findIndex(
            (review) =>
                review.user?.toString() ===
                userId?.toString()
        );


    if (existingIndex >= 0) {

        foodCard.reviews[
            existingIndex
        ].rating =
            numericRating;

        foodCard.reviews[
            existingIndex
        ].comment =
            comment?.trim() || "";

    } else {

        foodCard.reviews.push({

            user: userId,

            name:
                req.user?.fullname ||
                req.user?.fullName ||
                req.user?.name ||
                req.user?.email ||
                "User",

            rating:
                numericRating,

            comment:
                comment?.trim() || "",

            createdAt:
                new Date(),
        });
    }


    const totalReviews =
        foodCard.reviews.length;


    const avgRating =
        totalReviews === 0
            ? 0
            : foodCard.reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating || 0
                    ),
                0
            ) / totalReviews;


    foodCard.reviewCount =
        totalReviews;

    foodCard.rating =
        Number(
            avgRating.toFixed(2)
        );


    await foodCard.save();


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                rating:
                    foodCard.rating,

                reviewCount:
                    foodCard.reviewCount,

                reviews:
                    foodCard.reviews,
            },

            "Review saved"
        )
    );
});


// ============================================================
// GET FOOD CARD REVIEWS
// ============================================================

const getFoodCardReviews = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const foodCard =
        await FoodCard
            .findById(id)
            .select(
                "reviews rating reviewCount name"
            );


    if (!foodCard) {
        throw new ApiError(
            404,
            "Menu item not found"
        );
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                rating:
                    foodCard.rating,

                reviewCount:
                    foodCard.reviewCount,

                reviews:
                    foodCard.reviews,

                name:
                    foodCard.name,
            },

            "Reviews fetched"
        )
    );
});


// ============================================================
// GET FOOD CARD BY ID
// ============================================================

const getFoodCardById = asyncHandler(async (req, res) => {

    const { id } = req.params;


    // Validate MongoDB ObjectId
    if (
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        throw new ApiError(
            400,
            "Invalid product ID"
        );
    }


    const foodCard =
        await FoodCard.findOne({
            _id: id,
            isAvailable: true,
        }).lean();


    if (!foodCard) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            foodCard,
            "Product fetched successfully"
        )
    );
});


// ============================================================
// EXPORTS
// ============================================================

export {
    createFoodCard,
    getFoodCards,
    getMyFoodCards,
    getFoodCardById,
    updateFoodCard,
    deleteFoodCard,
    updateFoodCardRating,
    addFoodCardReview,
    getFoodCardReviews,
};