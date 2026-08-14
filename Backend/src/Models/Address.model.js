import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

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
            trim: true,
            default: "",
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
            trim: true,
            default: "",
        },

        type: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Address = mongoose.model(
    "Address",
    addressSchema
);