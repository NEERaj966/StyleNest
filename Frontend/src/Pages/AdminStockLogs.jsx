import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";


const AdminStockLogs = () => {
    const [logs, setLogs] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [downloading, setDownloading] =
        useState(false);

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({
            total: 0,
            totalPages: 1,
        });

    const [filters, setFilters] =
        useState({
            search: "",
            from: "",
            to: "",
        });


    /*
    =====================================================
    FETCH STOCK LOGS
    =====================================================
    */

    const fetchLogs = async () => {
        try {
            setLoading(true);

            const token =
                localStorage.getItem(
                    "adminToken"
                ) ||
                localStorage.getItem(
                    "token"
                );

            const response =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/stock-logs`,
                    {
                        params: {
                            page,
                            limit: 15,
                            search:
                                filters.search ||
                                undefined,
                            from:
                                filters.from ||
                                undefined,
                            to:
                                filters.to ||
                                undefined,
                        },

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const data =
                response.data?.data;

            setLogs(
                data?.items || []
            );

            setPagination({
                total:
                    data?.total || 0,

                totalPages:
                    data?.totalPages || 1,
            });

        } catch (error) {
            console.error(
                "Stock logs error:",
                error
            );

            alert(
                error?.response?.data
                    ?.message ||
                    "Failed to load stock logs."
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchLogs();
    }, [
        page,
        filters.from,
        filters.to,
    ]);


    /*
    =====================================================
    SEARCH
    =====================================================
    */

    const handleSearch = (e) => {
        e.preventDefault();

        setPage(1);

        fetchLogs();
    };


    /*
    =====================================================
    DOWNLOAD
    =====================================================
    */

    const downloadLogs = async () => {
        try {
            setDownloading(true);

            const token =
                localStorage.getItem(
                    "adminToken"
                ) ||
                localStorage.getItem(
                    "token"
                );

            const response =
                await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/stock-logs/download`,
                    {
                        params: {
                            from:
                                filters.from ||
                                undefined,

                            to:
                                filters.to ||
                                undefined,
                        },

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },

                        responseType:
                            "blob",
                    }
                );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type: "text/csv",
                    }
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                `stock-logs-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

        } catch (error) {
            console.error(
                "Download error:",
                error
            );

            alert(
                "Unable to download stock logs."
            );

        } finally {
            setDownloading(false);
        }
    };


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    const getChangeValue = (
        log
    ) => {
        return (
            log.change ??
            log.quantityChange ??
            log.quantity ??
            0
        );
    };


    const getChangeClass = (
        value
    ) => {
        if (Number(value) > 0) {
            return "bg-emerald-50 text-emerald-700";
        }

        if (Number(value) < 0) {
            return "bg-red-50 text-red-700";
        }

        return "bg-[#e5ded3] text-[#5d554c]";
    };


    /*
    =====================================================
    UI
    =====================================================
    */

    return (
        <div className="min-h-screen bg-[#eee8de] px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a94b2e]">
                            Admin Panel
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#24211d]">
                            Stock Logs
                        </h1>

                        <p className="mt-2 max-w-xl text-sm text-[#746b61]">
                            Monitor every stock movement,
                            product adjustment and inventory
                            activity.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={
                            downloadLogs
                        }
                        disabled={
                            downloading
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#24211d] px-5 py-3 text-sm font-bold text-[#f8f4ec] shadow-[0_3px_12px_rgba(36,33,29,0.04)] transition hover:bg-[#302b26] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span>
                            {downloading
                                ? "Preparing..."
                                : "↓"}
                        </span>

                        {downloading
                            ? "Downloading..."
                            : "Download CSV"}
                    </button>

                </div>


                {/* SUMMARY */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#877d72]">
                            Total Logs
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#24211d]">
                            {pagination.total}
                        </p>

                    </div>


                    <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#877d72]">
                            Current Page
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#24211d]">
                            {page}
                        </p>

                    </div>


                    <div className="rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-5 shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#877d72]">
                            Pages
                        </p>

                        <p className="mt-2 text-2xl font-black text-[#24211d]">
                            {
                                pagination.totalPages
                            }
                        </p>

                    </div>

                </div>


                {/* FILTERS */}

                <div className="mb-6 rounded-xl border border-[#d5cec2] bg-[#f8f4ec] p-4 shadow-[0_3px_12px_rgba(36,33,29,0.04)] sm:p-5">

                    <form
                        onSubmit={
                            handleSearch
                        }
                        className="grid grid-cols-1 gap-3 md:grid-cols-4"
                    >

                        <div className="md:col-span-2">

                            <label className="mb-1.5 block text-xs font-bold text-[#746b61]">
                                Search
                            </label>

                            <input
                                type="text"
                                value={
                                    filters.search
                                }
                                onChange={(e) =>
                                    setFilters(
                                        (prev) => ({
                                            ...prev,
                                            search:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="Search product, category, admin..."
                                className="h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm outline-none transition focus:border-[#9f9488] focus:bg-[#f8f4ec]"
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-xs font-bold text-[#746b61]">
                                From
                            </label>

                            <input
                                type="date"
                                value={
                                    filters.from
                                }
                                onChange={(e) =>
                                    setFilters(
                                        (prev) => ({
                                            ...prev,
                                            from:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm outline-none focus:border-[#9f9488]"
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-xs font-bold text-[#746b61]">
                                To
                            </label>

                            <input
                                type="date"
                                value={
                                    filters.to
                                }
                                onChange={(e) =>
                                    setFilters(
                                        (prev) => ({
                                            ...prev,
                                            to:
                                                e.target
                                                    .value,
                                        })
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 text-sm outline-none focus:border-[#9f9488]"
                            />

                        </div>


                        <div className="md:col-span-4 flex justify-end">

                            <button
                                type="submit"
                                className="rounded-xl bg-[#24211d] px-6 py-2.5 text-xs font-bold text-[#f8f4ec] hover:bg-[#302b26]"
                            >
                                Apply Filters
                            </button>

                        </div>

                    </form>

                </div>


                {/* TABLE */}

                <div className="overflow-hidden rounded-xl border border-[#d5cec2] bg-[#f8f4ec] shadow-[0_3px_12px_rgba(36,33,29,0.04)]">

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">

                            <div className="text-center">

                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d5cec2] border-t-slate-900" />

                                <p className="mt-3 text-sm text-[#746b61]">
                                    Loading stock logs...
                                </p>

                            </div>

                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#e5ded3] text-2xl">
                                📦
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-[#24211d]">
                                No stock logs found
                            </h3>

                            <p className="mt-1 text-sm text-[#746b61]">
                                Try changing your filters.
                            </p>

                        </div>
                    ) : (
                        <>

                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full text-left">

                                    <thead className="border-b border-[#e0d8cd] bg-[#eee8de]">

                                        <tr>

                                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#877d72]">
                                                Product
                                            </th>

                                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#877d72]">
                                                Change
                                            </th>

                                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#877d72]">
                                                Reason
                                            </th>

                                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#877d72]">
                                                Performed By
                                            </th>

                                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#877d72]">
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {logs.map(
                                            (
                                                log
                                            ) => {

                                                const change =
                                                    getChangeValue(
                                                        log
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            log._id
                                                        }
                                                        className="transition hover:bg-[#eee8de]"
                                                    >

                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-bold text-[#302b26]">
                                                                {
                                                                    log.foodCard
                                                                        ?.name ||
                                                                    "Unknown Product"
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#877d72]">
                                                                {
                                                                    log.foodCard
                                                                        ?.category ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${getChangeClass(
                                                                    change
                                                                )}`}
                                                            >
                                                                {Number(
                                                                    change
                                                                ) > 0
                                                                    ? "+"
                                                                    : ""}
                                                                {
                                                                    change
                                                                }
                                                            </span>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <p className="max-w-[180px] text-sm text-[#5d554c]">
                                                                {
                                                                    log.reason ||
                                                                    "Stock adjustment"
                                                                }
                                                            </p>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <p className="text-sm font-semibold text-[#3e3730]">
                                                                {
                                                                    log.admin
                                                                        ?.fullname ||
                                                                    log.user
                                                                        ?.fullname ||
                                                                    "System"
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#877d72]">
                                                                {
                                                                    log.admin
                                                                        ?.email ||
                                                                    log.user
                                                                        ?.email ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </td>


                                                        <td className="whitespace-nowrap px-5 py-4">

                                                            <p className="text-sm font-medium text-[#3e3730]">
                                                                {new Date(
                                                                    log.createdAt
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-[#877d72]">
                                                                {new Date(
                                                                    log.createdAt
                                                                ).toLocaleTimeString(
                                                                    "en-IN",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </p>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* MOBILE CARDS */}

                            <div className="divide-y divide-slate-100 md:hidden">

                                {logs.map(
                                    (
                                        log
                                    ) => {

                                        const change =
                                            getChangeValue(
                                                log
                                            );

                                        return (
                                            <div
                                                key={
                                                    log._id
                                                }
                                                className="p-5"
                                            >

                                                <div className="flex items-start justify-between gap-4">

                                                    <div>

                                                        <p className="text-sm font-bold text-[#24211d]">
                                                            {
                                                                log.foodCard
                                                                    ?.name ||
                                                                "Unknown Product"
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#877d72]">
                                                            {
                                                                log.foodCard
                                                                    ?.category ||
                                                                "—"
                                                            }
                                                        </p>

                                                    </div>


                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-black ${getChangeClass(
                                                            change
                                                        )}`}
                                                    >
                                                        {Number(
                                                            change
                                                        ) > 0
                                                            ? "+"
                                                            : ""}
                                                        {
                                                            change
                                                        }
                                                    </span>

                                                </div>


                                                <div className="mt-4 grid grid-cols-2 gap-3">

                                                    <div className="rounded-xl bg-[#eee8de] p-3">

                                                        <p className="text-[10px] font-bold uppercase text-[#877d72]">
                                                            Reason
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-[#3e3730]">
                                                            {
                                                                log.reason ||
                                                                "Adjustment"
                                                            }
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-[#eee8de] p-3">

                                                        <p className="text-[10px] font-bold uppercase text-[#877d72]">
                                                            Date
                                                        </p>

                                                        <p className="mt-1 text-xs font-semibold text-[#3e3730]">
                                                            {new Date(
                                                                log.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </>
                    )}

                </div>


                {/* PAGINATION */}

                {pagination.totalPages >
                    1 && (
                    <div className="mt-5 flex items-center justify-between rounded-xl border border-[#d5cec2] bg-[#f8f4ec] px-4 py-3">

                        <button
                            type="button"
                            disabled={
                                page ===
                                1
                            }
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        Math.max(
                                            prev -
                                                1,
                                            1
                                        )
                                )
                            }
                            className="rounded-xl border border-[#d5cec2] px-4 py-2 text-xs font-bold text-[#3e3730] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>


                        <span className="text-xs font-bold text-[#746b61]">
                            Page {page} of{" "}
                            {
                                pagination.totalPages
                            }
                        </span>


                        <button
                            type="button"
                            disabled={
                                page >=
                                pagination.totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (prev) =>
                                        prev +
                                        1
                                )
                            }
                            className="rounded-xl border border-[#d5cec2] px-4 py-2 text-xs font-bold text-[#3e3730] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next →
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminStockLogs;