import { Feedback } from '../Models/Feedback.model.js'
import { asyncHandler } from '../utills/AsyncHanddler.js'
import { ApiError } from '../utills/ApiError.js'
import { ApiResponse } from '../utills/ApiResponse.js'

const createFeedback = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        throw new ApiError(400, "All fields are required")
    }

    const feedback = await Feedback.create({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
    })

    return res.status(201).json(
        new ApiResponse(
            200,
            feedback,
            "Feedback submitted"
        )
    )
})

export { createFeedback }
