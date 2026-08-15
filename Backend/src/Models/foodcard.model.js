import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const foodCardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        category: {
            type: String,
            required: true,
            enum: ['Women', 'Men', 'Kids', 'Other'],
            default: 'Other',
        },
        sizes: {
            type: [String],
            default: [],
            set: (sizes) =>
                Array.isArray(sizes)
                    ? [
                          ...new Set(
                              sizes
                                  .map((size) =>
                                      String(size || '').trim()
                                  )
                                  .filter(Boolean)
                          ),
                      ]
                    : [],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        imageUrl: {
            type: String,
            default: '',
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: (images) => images.length <= 2,
                message: "A product can have maximum 2 images",
            }
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 4.5,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        reviews: {
            type: [reviewSchema],
            default: [],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    { timestamps: true }
);

export const FoodCard = mongoose.model('FoodCard', foodCardSchema);
