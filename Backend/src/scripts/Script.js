import mongoose from "mongoose";
import dotenv from "dotenv";
import {Admin} from "../Models/Admin.model.js";
import { ApiError } from "../utills/ApiError.js";

dotenv.config();


const registerAdmin = async () => {


    try {
    // 1. Connect to MongoDB FIRST
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res




    const existedAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL })


    if (existedAdmin) {
        throw new ApiError(409, "User with email  already exists")
        return;
    }

    const admin = await Admin.create({
        fullname: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        location: process.env.ADMIN_LOCATION
    })


    if (!admin) {
        throw new ApiError(500, "Something went wrong while registering the Admin")
    }


    console.log("Admin created successfully");
    console.log("Admin ID:", admin._id);
  } catch (error) {
    console.error("Error registering admin:", error);
  } finally {
    // 5. Close MongoDB connection
    await mongoose.connection.close();
  }
}

registerAdmin();