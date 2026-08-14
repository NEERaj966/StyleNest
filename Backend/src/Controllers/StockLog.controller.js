import mongoose from "mongoose";
import { StockLog } from "../Models/StockLog.model.js";
import { asyncHandler } from "../utills/AsyncHanddler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";

/*
=========================================================
GET STOCK LOGS
=========================================================
*/

const getStockLogs = asyncHandler(async (req, res) => {
    const {
        foodCardId,
        page = 1,
        limit = 20,
        from,
        to,
        search,
    } = req.query;

    const parsedPage = Math.max(
        Number(page) || 1,
        1
    );

    const parsedLimit = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
    );

    /*
    -----------------------------------------------------
    VALIDATE FOOD CARD ID
    -----------------------------------------------------
    */

    if (
        foodCardId &&
        !mongoose.Types.ObjectId.isValid(foodCardId)
    ) {
        throw new ApiError(
            400,
            "Invalid food card id"
        );
    }

    /*
    -----------------------------------------------------
    BUILD FILTER
    -----------------------------------------------------
    */

    const filter = {};

    if (foodCardId) {
        filter.foodCard = foodCardId;
    }

    /*
    -----------------------------------------------------
    DATE FILTER
    -----------------------------------------------------
    */

    if (from || to) {
        filter.createdAt = {};

        if (from) {
            const fromDate = new Date(from);

            if (!Number.isNaN(fromDate.getTime())) {
                fromDate.setHours(0, 0, 0, 0);

                filter.createdAt.$gte = fromDate;
            }
        }

        if (to) {
            const toDate = new Date(to);

            if (!Number.isNaN(toDate.getTime())) {
                toDate.setHours(
                    23,
                    59,
                    59,
                    999
                );

                filter.createdAt.$lte = toDate;
            }
        }

        if (
            Object.keys(filter.createdAt).length ===
            0
        ) {
            delete filter.createdAt;
        }
    }

    /*
    -----------------------------------------------------
    SEARCH
    -----------------------------------------------------
    
    Search is done after populating because product
    name/category are stored in FoodCard.
    */

    const [items, total] =
        await Promise.all([
            StockLog.find(filter)
                .populate(
                    "foodCard",
                    "name category price quantity"
                )
                .populate(
                    "admin",
                    "fullname email"
                )
                .populate(
                    "user",
                    "fullname email"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(
                    (parsedPage - 1) *
                        parsedLimit
                )
                .limit(parsedLimit)
                .lean(),

            StockLog.countDocuments(filter),
        ]);

    /*
    -----------------------------------------------------
    OPTIONAL SEARCH
    -----------------------------------------------------
    */

    let filteredItems = items;

    if (search?.trim()) {
        const searchText =
            search.trim().toLowerCase();

        filteredItems =
            items.filter((item) => {
                const productName =
                    item.foodCard?.name
                        ?.toLowerCase() || "";

                const category =
                    item.foodCard?.category
                        ?.toLowerCase() || "";

                const adminName =
                    item.admin?.fullname
                        ?.toLowerCase() || "";

                const userName =
                    item.user?.fullname
                        ?.toLowerCase() || "";

                return (
                    productName.includes(
                        searchText
                    ) ||
                    category.includes(
                        searchText
                    ) ||
                    adminName.includes(
                        searchText
                    ) ||
                    userName.includes(
                        searchText
                    )
                );
            });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items: filteredItems,
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages:
                    Math.ceil(
                        total /
                            parsedLimit
                    ),
            },
            "Stock logs fetched successfully"
        )
    );
});


/*
=========================================================
DOWNLOAD STOCK LOGS
=========================================================
*/

const downloadStockLogs =
    asyncHandler(async (req, res) => {
        const {
            foodCardId,
            from,
            to,
        } = req.query;

        /*
        -------------------------------------------------
        VALIDATE PRODUCT
        -------------------------------------------------
        */

        if (
            foodCardId &&
            !mongoose.Types.ObjectId.isValid(
                foodCardId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid food card id"
            );
        }

        /*
        -------------------------------------------------
        BUILD FILTER
        -------------------------------------------------
        */

        const filter = {};

        if (foodCardId) {
            filter.foodCard =
                foodCardId;
        }

        /*
        -------------------------------------------------
        DATE FILTER
        -------------------------------------------------
        */

        if (from || to) {
            filter.createdAt = {};

            if (from) {
                const fromDate =
                    new Date(from);

                if (
                    !Number.isNaN(
                        fromDate.getTime()
                    )
                ) {
                    fromDate.setHours(
                        0,
                        0,
                        0,
                        0
                    );

                    filter.createdAt.$gte =
                        fromDate;
                }
            }

            if (to) {
                const toDate =
                    new Date(to);

                if (
                    !Number.isNaN(
                        toDate.getTime()
                    )
                ) {
                    toDate.setHours(
                        23,
                        59,
                        59,
                        999
                    );

                    filter.createdAt.$lte =
                        toDate;
                }
            }
        }

        /*
        -------------------------------------------------
        FETCH ALL LOGS
        -------------------------------------------------
        */

        const logs =
            await StockLog.find(filter)
                .populate(
                    "foodCard",
                    "name category"
                )
                .populate(
                    "admin",
                    "fullname email"
                )
                .populate(
                    "user",
                    "fullname email"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();

        /*
        -------------------------------------------------
        CSV ESCAPE FUNCTION
        -------------------------------------------------
        */

        const escapeCSV = (value) => {
            if (
                value === null ||
                value === undefined
            ) {
                return "";
            }

            const stringValue =
                String(value);

            return `"${stringValue.replace(
                /"/g,
                '""'
            )}"`;
        };

        /*
        -------------------------------------------------
        CSV HEADER
        -------------------------------------------------
        */

        const header = [
            "Date",
            "Product",
            "Category",
            "Change",
            "Reason",
            "Admin",
            "Admin Email",
            "User",
            "User Email",
        ];

        /*
        -------------------------------------------------
        CSV ROWS
        -------------------------------------------------
        */

        const rows = logs.map(
            (log) => [
                new Date(
                    log.createdAt
                ).toLocaleString("en-IN"),

                log.foodCard?.name ||
                    "Unknown Product",

                log.foodCard?.category ||
                    "",

                log.change ??
                    log.quantityChange ??
                    log.quantity ??
                    0,

                log.reason || "",

                log.admin?.fullname ||
                    "",

                log.admin?.email ||
                    "",

                log.user?.fullname ||
                    "",

                log.user?.email ||
                    "",
            ]
        );

        /*
        -------------------------------------------------
        CREATE CSV
        -------------------------------------------------
        */

        const csv = [
            header,
            ...rows,
        ]
            .map((row) =>
                row
                    .map(escapeCSV)
                    .join(",")
            )
            .join("\n");

        /*
        -------------------------------------------------
        RESPONSE
        -------------------------------------------------
        */

        const filename = `stock-logs-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        return res.status(200).send(csv);
    });


export {
    getStockLogs,
    downloadStockLogs,
};