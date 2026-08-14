import { Router } from "express";

import {
    getStockLogs,
    downloadStockLogs,
} from "../Controllers/StockLog.controller.js";

import {
    verifyJWTForAdmin,
} from "../Middleware/auth.middleware.js";


const router = Router();

/*
=========================================================
GET STOCK LOGS
=========================================================
*/

router.get(
    "/",
    verifyJWTForAdmin,
    getStockLogs
);


/*
=========================================================
DOWNLOAD STOCK LOGS
=========================================================
*/

router.get(
    "/download",
    verifyJWTForAdmin,
    downloadStockLogs
);

export default router;