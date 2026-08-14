import { Admin } from '../Models/Admin.model.js'
import { asyncHandler } from '../utills/AsyncHanddler.js'
import { ApiError } from '../utills/ApiError.js'
import { ApiResponse } from '../utills/ApiResponse.js'
import { blackListTokenModel } from '../Models/BlackListToken.js'



const registerAdmin = async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const fullname = process.env.ADMIN_NAME
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const location = process.env.ADMIN_LOCATION



    if (
        [fullname, email, password , location].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    const existedAdmin = await Admin.findOne({ email})


    if (existedAdmin) {
        throw new ApiError(409, "User with email  already exists")
    }

    const admin = await Admin.create({
        fullname,
        email,
        password, 
        location
    })

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password "
    )

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the Admin")
    }

    const token = admin.generateAuthToken();

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                user: createdAdmin, token
            },
            "User registered Successfully")
    )
}


const loginAdmin = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body


    if (!email) {
        throw new ApiError(400, " email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const admin = await Admin.findOne({ email }).select("+password")

    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

    const isPasswordValid = await admin.ispasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Admin credentials")
    }



    //    console.log(accessToken);
    //    console.log(refreshToken);


    const loggedInAdmin = await Admin.findById(admin._id).select("-password ")

    const options = {
        httpOnly: true,
        secure: true
    }

    const token = admin.generateAuthToken();

    return res
        .status(200)
        .cookie("authtoken", token, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInAdmin, token
                },
                "Admin logged In Successfully"
            )
        )

})

const getAdminProfile = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.admin,
                "Admin profile"
            )
        )
})

const logoutAdmin = asyncHandler(async (req, res) => {

    const token = req.cookies?.authtoken || req.header("Authorization")?.replace("Bearer ", "")

    await blackListTokenModel.create({ token });


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("authtoken", options)
        .json(new ApiResponse(200, {}, "Admin logged Out"))
})



export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAdminProfile

}
