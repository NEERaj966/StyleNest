import jwt from 'jsonwebtoken'
import { ApiError } from '../utills/ApiError.js'
import { asyncHandler } from '../utills/AsyncHanddler.js'
import { User } from '../Models/UserModel.js'
import { blackListTokenModel } from '../Models/BlackListToken.js'
import { Admin } from '../Models/Admin.model.js'

export const verifyJWTForUser = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password ")

        if (!user) {

            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})


export const verifyJWTForAdmin = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        const admin = await Admin.findById(decodedToken?._id).select("-password ")

        if (!admin) {

            throw new ApiError(401, "Invalid Access Token")
        }

        req.admin = admin;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})
