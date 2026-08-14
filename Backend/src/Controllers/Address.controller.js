import mongoose from "mongoose";

import { asyncHandler } from "../utills/AsyncHanddler.js";
import { Address } from "../models/Address.model.js";
import { ApiResponse } from "../utills/ApiResponse.js";

// ======================================================
// HELPER
// ======================================================

const getUserId = (req) => {
    return req.user?._id;
};

// ======================================================
// VALIDATE OBJECT ID
// ======================================================

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// VALIDATE ADDRESS TYPE
// ======================================================

const isValidAddressType = (type) => {
    return ["Home", "Work", "Other"].includes(type);
};

// ======================================================
// VALIDATE PHONE
// ======================================================

const isValidPhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
};

// ======================================================
// VALIDATE PINCODE
// ======================================================

const isValidPincode = (pincode) => {
    return /^[0-9]{6}$/.test(pincode);
};

// ======================================================
// GET ALL ADDRESSES
// GET /api/v1/addresses
// ======================================================

const getAddresses = asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
        return res.status(401).json(
            new ApiResponse(
                401,
                null,
                "Unauthorized"
            )
        );
    }

    const addresses = await Address.find({
        user: userId,
    }).sort({
        isDefault: -1,
        createdAt: -1,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                addresses,
            },
            "Addresses fetched successfully"
        )
    );
});

// ======================================================
// GET DEFAULT ADDRESS
// GET /api/v1/addresses/default
// ======================================================

const getDefaultAddress = asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
        return res.status(401).json(
            new ApiResponse(
                401,
                null,
                "Unauthorized"
            )
        );
    }

    const address = await Address.findOne({
        user: userId,
        isDefault: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                address: address || null,
            },
            address
                ? "Default address fetched successfully"
                : "No default address found"
        )
    );
});

// ======================================================
// GET ADDRESS BY ID
// GET /api/v1/addresses/:id
// ======================================================

const getAddressById = asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json(
            new ApiResponse(
                401,
                null,
                "Unauthorized"
            )
        );
    }

    if (!isValidObjectId(id)) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Invalid address ID"
            )
        );
    }

    const address = await Address.findOne({
        _id: id,
        user: userId,
    });

    if (!address) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                "Address not found"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                address,
            },
            "Address fetched successfully"
        )
    );
});

// ======================================================
// CREATE ADDRESS
// POST /api/v1/addresses
// ======================================================

const createAddress = asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
        return res.status(401).json(
            new ApiResponse(
                401,
                null,
                "Unauthorized"
            )
        );
    }

    const {
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
        type,
        isDefault,
    } = req.body;

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (
        !name?.trim() ||
        !phone?.trim() ||
        !addressLine1?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !pincode?.trim()
    ) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide all required address fields"
            )
        );
    }

    // --------------------------------------------------
    // PHONE
    // --------------------------------------------------

    const cleanPhone = phone.trim();

    if (!isValidPhone(cleanPhone)) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide a valid 10-digit phone number"
            )
        );
    }

    // --------------------------------------------------
    // PINCODE
    // --------------------------------------------------

    const cleanPincode = pincode.trim();

    if (!isValidPincode(cleanPincode)) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide a valid 6-digit pincode"
            )
        );
    }

    // --------------------------------------------------
    // ADDRESS TYPE
    // --------------------------------------------------

    const addressType = type || "Home";

    if (!isValidAddressType(addressType)) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Address type must be Home, Work or Other"
            )
        );
    }

    // --------------------------------------------------
    // CHECK EXISTING ADDRESSES
    // --------------------------------------------------

    const existingAddress = await Address.findOne({
        user: userId,
    });

    /*
     * First address automatically becomes default.
     *
     * Boolean and string values are both handled.
     */

    const wantsDefault =
        isDefault === true ||
        isDefault === "true";

    const shouldBeDefault =
        !existingAddress || wantsDefault;

    // --------------------------------------------------
    // REMOVE OLD DEFAULT
    // --------------------------------------------------

    if (shouldBeDefault) {
        await Address.updateMany(
            {
                user: userId,
                isDefault: true,
            },
            {
                $set: {
                    isDefault: false,
                },
            }
        );
    }

    // --------------------------------------------------
    // CREATE ADDRESS
    // --------------------------------------------------

    const address = await Address.create({
        user: userId,

        name: name.trim(),

        phone: cleanPhone,

        addressLine1:
            addressLine1.trim(),

        addressLine2:
            addressLine2?.trim() || "",

        city:
            city.trim(),

        state:
            state.trim(),

        pincode:
            cleanPincode,

        landmark:
            landmark?.trim() || "",

        type:
            addressType,

        isDefault:
            shouldBeDefault,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                address,
            },
            "Address added successfully"
        )
    );
});

// ======================================================
// UPDATE ADDRESS
// PUT /api/v1/addresses/:id
// ======================================================

const updateAddress = asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json(
            new ApiResponse(
                401,
                null,
                "Unauthorized"
            )
        );
    }

    if (!isValidObjectId(id)) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Invalid address ID"
            )
        );
    }

    const address = await Address.findOne({
        _id: id,
        user: userId,
    });

    if (!address) {
        return res.status(404).json(
            new ApiResponse(
                404,
                null,
                "Address not found"
            )
        );
    }

    const {
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
        type,
        isDefault,
    } = req.body;

    // --------------------------------------------------
    // VALIDATE ONLY PROVIDED VALUES
    // --------------------------------------------------

    if (
        phone !== undefined &&
        !isValidPhone(phone.trim())
    ) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide a valid 10-digit phone number"
            )
        );
    }

    if (
        pincode !== undefined &&
        !isValidPincode(pincode.trim())
    ) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide a valid 6-digit pincode"
            )
        );
    }

    if (
        type !== undefined &&
        !isValidAddressType(type)
    ) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Address type must be Home, Work or Other"
            )
        );
    }

    // --------------------------------------------------
    // DEFAULT ADDRESS LOGIC
    // --------------------------------------------------

    const wantsDefault =
        isDefault === true ||
        isDefault === "true";

    const wantsNonDefault =
        isDefault === false ||
        isDefault === "false";

    // If making this address default
    if (wantsDefault) {
        await Address.updateMany(
            {
                user: userId,
                _id: {
                    $ne: id,
                },
                isDefault: true,
            },
            {
                $set: {
                    isDefault: false,
                },
            }
        );

        address.isDefault = true;
    }

    // --------------------------------------------------
    // DO NOT ALLOW DEFAULT TO BECOME FALSE IF
    // IT IS THE ONLY ADDRESS
    // --------------------------------------------------

    else if (
        wantsNonDefault &&
        address.isDefault
    ) {
        const otherAddress = await Address.findOne({
            user: userId,
            _id: {
                $ne: id,
            },
        });

        if (otherAddress) {
            address.isDefault = false;
        } else {
            address.isDefault = true;
        }
    }

    // --------------------------------------------------
    // UPDATE FIELDS
    // --------------------------------------------------

    if (name !== undefined) {
        address.name = name.trim();
    }

    if (phone !== undefined) {
        address.phone = phone.trim();
    }

    if (addressLine1 !== undefined) {
        address.addressLine1 =
            addressLine1.trim();
    }

    if (addressLine2 !== undefined) {
        address.addressLine2 =
            addressLine2.trim();
    }

    if (city !== undefined) {
        address.city =
            city.trim();
    }

    if (state !== undefined) {
        address.state =
            state.trim();
    }

    if (pincode !== undefined) {
        address.pincode =
            pincode.trim();
    }

    if (landmark !== undefined) {
        address.landmark =
            landmark.trim();
    }

    if (type !== undefined) {
        address.type = type;
    }

    await address.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                address,
            },
            "Address updated successfully"
        )
    );
});

// ======================================================
// SET DEFAULT ADDRESS
// PATCH /api/v1/addresses/:id/default
// ======================================================

const setDefaultAddress = asyncHandler(
    async (req, res) => {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json(
                new ApiResponse(
                    401,
                    null,
                    "Unauthorized"
                )
            );
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Invalid address ID"
                )
            );
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    null,
                    "Address not found"
                )
            );
        }

        // Remove default from every other address
        await Address.updateMany(
            {
                user: userId,
                _id: {
                    $ne: id,
                },
            },
            {
                $set: {
                    isDefault: false,
                },
            }
        );

        // Make selected address default
        address.isDefault = true;

        await address.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    address,
                },
                "Default address updated successfully"
            )
        );
    }
);

// ======================================================
// DELETE ADDRESS
// DELETE /api/v1/addresses/:id
// ======================================================

const deleteAddress = asyncHandler(
    async (req, res) => {
        const userId = getUserId(req);
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json(
                new ApiResponse(
                    401,
                    null,
                    "Unauthorized"
                )
            );
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Invalid address ID"
                )
            );
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    null,
                    "Address not found"
                )
            );
        }

        const wasDefault =
            address.isDefault;

        await Address.deleteOne({
            _id: id,
            user: userId,
        });

        // --------------------------------------------------
        // IF DEFAULT WAS DELETED
        // MAKE ANOTHER ADDRESS DEFAULT
        // --------------------------------------------------

        if (wasDefault) {
            const nextAddress =
                await Address.findOne({
                    user: userId,
                }).sort({
                    createdAt: -1,
                });

            if (nextAddress) {
                nextAddress.isDefault = true;

                await nextAddress.save();
            }
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Address deleted successfully"
            )
        );
    }
);

// ======================================================
// EXPORT
// ======================================================

export {
    getAddresses,
    getDefaultAddress,
    getAddressById,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};