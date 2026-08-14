import { User } from '../Models/UserModel.js'
import { FoodCard } from '../Models/foodcard.model.js'
import { asyncHandler } from '../utills/AsyncHanddler.js'
import { ApiError } from '../utills/ApiError.js'
import { ApiResponse } from '../utills/ApiResponse.js'
import { blackListTokenModel } from '../Models/BlackListToken.js'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)



const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    const { fullname, email, password } = req.body



    if (
        [fullname, email,  password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }




    const existedUser = await User.findOne({ email })



    //      res.status(200).json({
    //      message:'OK'
    //  })


    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullname,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password "
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const token = user.generateAuthToken();

    return res.status(201).json(
        new ApiResponse(
           201, 
            {
                user: createdUser,token
            },
            "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password} = req.body

    if (!email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.ispasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   

//    console.log(accessToken);
//    console.log(refreshToken);
   

    const loggedInUser = await User.findById(user._id).select("-password ")
    const options = {
        httpOnly: true,
        secure: true
    }

    const token = user.generateAuthToken();

    return res
    .status(200)
    .cookie("authtoken", token, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, token
            },
            "User logged In Successfully"
        )
    )

})


const getUserProfile = asyncHandler(async (req , res , next ) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "User profile"
        )
    )
})


const logoutUser = asyncHandler(async (req, res) => {
    
    const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

    await blackListTokenModel.create({ token });


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("authtoken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const loginWithGoogle = asyncHandler(async (req, res) => {
    const { credential } = req.body

    if (!credential) {
        throw new ApiError(400, "Google credential is required")
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new ApiError(500, "Google client ID is not configured")
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload?.email || !payload?.email_verified) {
        throw new ApiError(400, "Google email is not verified")
    }

    const email = payload.email
    const fullname = payload.name || payload.given_name || email.split("@")[0]

    let user = await User.findOne({ email })

    if (!user) {
        const randomPassword = crypto.randomBytes(16).toString("hex")
        user = await User.create({
            fullname,
            email,
            password: randomPassword,
            googleId: payload.sub || ''
        })
    } else if (!user.googleId && payload.sub) {
        user.googleId = payload.sub
        await user.save()
    }

    const userData = await User.findById(user._id).select("-password ")
    const token = user.generateAuthToken()

    return res.status(200).json(
        new ApiResponse(
            200,
            { user: userData, token },
            "User logged in with Google"
        )
    )
})

const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).populate('favorites')
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user.favorites || [], "Favorites fetched")
    )
})

const addFavorite = asyncHandler(async (req, res) => {
    const { foodCardId } = req.params

    if (!foodCardId || !mongoose.Types.ObjectId.isValid(foodCardId)) {
        throw new ApiError(400, "Invalid food card id")
    }

    const item = await FoodCard.findById(foodCardId)
    if (!item) {
        throw new ApiError(404, "Food item not found")
    }

    const updated = await User.findByIdAndUpdate(
        req.user?._id,
        { $addToSet: { favorites: foodCardId } },
        { new: true }
    ).populate('favorites')

    return res.status(200).json(
        new ApiResponse(200, updated?.favorites || [], "Added to favorites")
    )
})

const removeFavorite = asyncHandler(async (req, res) => {
    const { foodCardId } = req.params

    if (!foodCardId || !mongoose.Types.ObjectId.isValid(foodCardId)) {
        throw new ApiError(400, "Invalid food card id")
    }

    const updated = await User.findByIdAndUpdate(
        req.user?._id,
        { $pull: { favorites: foodCardId } },
        { new: true }
    ).populate('favorites')

    return res.status(200).json(
        new ApiResponse(200, updated?.favorites || [], "Removed from favorites")
    )
})




export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    getFavorites,
    addFavorite,
    removeFavorite,
    loginWithGoogle
}
