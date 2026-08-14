import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
