import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { ApiError } from './utills/ApiError.js'
import { ApiResponse } from './utills/ApiResponse.js'

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`))
    },
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//routers

import userRouter from './routes/UserRoutes.js'
import adminRouter from './routes/AdminRoutes.js'
import foodCardRouter from './routes/FoodCardRoutes.js'
import feedbackRouter from './routes/FeedbackRoutes.js'
import orderRouter from './routes/OrderRoutes.js'
import stockRouter from './routes/StockRoutes.js'
import AddressRouter from './routes/AddressRoutes.js'
import adminOrderRoutes from "./routes/AdminOrderRoutes.js";


// //routes declaration

app.get("/", (_, res) => {
    return res.status(200).json(
        new ApiResponse(200, { status: "ok" }, "Canteen backend is running")
    )
})

app.get("/api/v1/health", (_, res) => {
    return res.status(200).json(
        new ApiResponse(200, { status: "ok" }, "Canteen backend is healthy")
    )
})

app.use("/api/v1/users", userRouter)
app.use("/api/v1/admins", adminRouter)
app.use("/api/v1/foodcards", foodCardRouter)
app.use("/api/v1/feedback", feedbackRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/stock-logs", stockRouter)
app.use("/api/v1/addressesDetail", AddressRouter)
app.use("/api/v1/admin/orders", adminOrderRoutes);

app.use((req, _, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`))
})

app.use((err, _, res, __) => {
    const statusCode = err.statusCode || 500

    if (statusCode >= 500) {
        console.error(err)
    }

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message: err.message || "Internal server error",
        success: false,
        errors: err.errors || [],
    })
})

export {
    app
}