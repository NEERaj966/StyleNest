import React, {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
    AdminDataContext,
} from "../Context/AdminDataContext.js";

import useThrottle from "../Hooks/useThrottle";

const AdminNavbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const {
        Admin,
        setAdmin,
    } = useContext(AdminDataContext);

    const navigate = useNavigate();
    const location = useLocation();

    // =========================================================
    // GET ADMIN PROFILE
    // =========================================================

    useEffect(() => {
        const token =
            localStorage.getItem("adminToken");

        if (!token || Admin) {
            return;
        }

        axios
            .get(
                `${import.meta.env.VITE_BASE_URL}/api/v1/admins/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                if (response.status === 200) {
                    setAdmin(
                        response.data?.data ?? null
                    );
                }
            })
            .catch(() => {
                localStorage.removeItem(
                    "adminToken"
                );

                setAdmin(null);

                navigate("/admin/login");
            });
    }, [Admin, setAdmin, navigate]);

    // =========================================================
    // ADMIN NAME
    // =========================================================

    const adminDisplayName =
        Admin?.fullname ||
        Admin?.fullName ||
        Admin?.name ||
        (Admin?.email
            ? Admin.email.split("@")[0]
            : "");

    const adminInitial =
        adminDisplayName
            ? adminDisplayName[0].toUpperCase()
            : "A";

    // =========================================================
    // THROTTLED MENU TOGGLE
    // =========================================================

    const toggleMenu = useThrottle(() => {
        setMenuOpen((prev) => !prev);
    }, 500);

    // =========================================================
    // THROTTLED MOBILE MENU TOGGLE
    // =========================================================

    const toggleMobileMenu = useThrottle(() => {
        setMobileOpen((prev) => !prev);
    }, 500);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const navItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />
                </svg>
            ),
        },

        {
            name: "Products",
            path: "/admin/menu",
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />

                    <path d="m3.3 7 8.7 5 8.7-5" />

                    <path d="M12 22V12" />
                </svg>
            ),
        },

        {
            name: "Orders",
            path: "/admin/orders",
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path d="M6 2h12v4H6z" />

                    <path d="M4 6h16v16H4z" />

                    <path d="M8 10h8M8 14h8M8 18h5" />
                </svg>
            ),
        },

        {
            name: "Stock Logs",
            path: "/admin/stock-logs",
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path d="M4 19V5" />

                    <path d="M4 19h16" />

                    <path d="m7 15 3-4 3 2 5-6" />

                    <circle
                        cx="7"
                        cy="15"
                        r="1"
                    />

                    <circle
                        cx="10"
                        cy="11"
                        r="1"
                    />

                    <circle
                        cx="13"
                        cy="13"
                        r="1"
                    />

                    <circle
                        cx="18"
                        cy="7"
                        r="1"
                    />
                </svg>
            ),
        },
    ];

    // =========================================================
    // ACTIVE ROUTE
    // =========================================================

    const isActive = (path) => {
        return location.pathname === path;
    };

    // =========================================================
    // THROTTLED LOGOUT
    // =========================================================

    const handleAdminLogout = useThrottle(
        async () => {
            const token =
                localStorage.getItem(
                    "adminToken"
                );

            try {
                if (token) {
                    await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/admins/logout`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );
                }
            } catch {
                // Authentication is cleared locally
                // even if the server logout request fails.
            } finally {
                localStorage.removeItem(
                    "adminToken"
                );

                setAdmin(null);

                setMenuOpen(false);

                setMobileOpen(false);

                navigate(
                    "/admin/login",
                    {
                        replace: true,
                    }
                );
            }
        },
        1000
    );

    // =========================================================
    // MOBILE NAVIGATION
    // =========================================================

    const handleMobileNavigation =
        useThrottle(() => {
            setMobileOpen(false);
        }, 300);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">

            {/* =================================================
                MAIN NAVIGATION
            ================================================= */}

            <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* =================================================
                    BRAND
                ================================================= */}

                <Link
                    to="/admin"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
                        <span className="text-sm font-black tracking-tight text-white">
                            SN
                        </span>
                    </div>

                    <div className="hidden leading-tight sm:block">
                        <p className="text-sm font-black tracking-tight text-slate-900">
                            StyleNest
                        </p>

                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Admin Panel
                        </p>
                    </div>
                </Link>

                {/* =================================================
                    DESKTOP NAVIGATION
                ================================================= */}

                <div className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">

                    {navItems.map((item) => {
                        const active =
                            isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-2
                                    rounded-xl px-4 py-2.5
                                    text-sm font-semibold
                                    transition-all duration-200
                                    ${
                                        active
                                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-500 hover:bg-white hover:text-slate-900"
                                    }
                                `}
                            >
                                <span
                                    className={
                                        active
                                            ? "text-amber-500"
                                            : "text-slate-400"
                                    }
                                >
                                    {item.icon}
                                </span>

                                {item.name}
                            </Link>
                        );
                    })}

                </div>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="flex items-center gap-2">

                    {/* LIVE STATUS */}

                    <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 lg:flex">

                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Live
                        </span>

                    </div>

                    {/* =================================================
                        ADMIN PROFILE
                    ================================================= */}

                    {Admin ? (
                        <div className="relative hidden md:block">

                            <button
                                type="button"
                                onClick={toggleMenu}
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:bg-slate-50"
                            >

                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                                    {adminInitial}
                                </span>

                                <div className="hidden text-left lg:block">

                                    <p className="max-w-[110px] truncate text-xs font-bold text-slate-800">
                                        {adminDisplayName ||
                                            "Admin"}
                                    </p>

                                    <p className="text-[10px] text-slate-400">
                                        Administrator
                                    </p>

                                </div>

                                <svg
                                    className={`h-4 w-4 text-slate-400 transition-transform ${
                                        menuOpen
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>

                            </button>

                            {/* =================================================
                                PROFILE DROPDOWN
                            ================================================= */}

                            {menuOpen && (
                                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

                                    {/* PROFILE HEADER */}

                                    <div className="bg-slate-900 p-5">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-900">
                                                {adminInitial}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-bold text-white">
                                                    {adminDisplayName ||
                                                        "Admin"}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-slate-400">
                                                    {Admin?.email ||
                                                        "Admin account"}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ACCOUNT INFORMATION */}

                                    <div className="p-3">

                                        <div className="mb-3 rounded-2xl bg-slate-50 p-3">

                                            <div className="flex items-center justify-between">

                                                <span className="text-xs text-slate-400">
                                                    Account
                                                </span>

                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold uppercase text-emerald-700">
                                                    Active
                                                </span>

                                            </div>

                                            {Admin?.location && (
                                                <p className="mt-2 text-xs font-medium text-slate-600">
                                                    📍{" "}
                                                    {Admin.location}
                                                </p>
                                            )}

                                        </div>

                                        {/* LOGOUT */}

                                        <button
                                            type="button"
                                            onClick={
                                                handleAdminLogout
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                        >

                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M10 17l5-5-5-5" />

                                                <path d="M15 12H3" />

                                                <path d="M21 3v18" />
                                            </svg>

                                            Logout

                                        </button>

                                    </div>

                                </div>
                            )}

                        </div>
                    ) : (
                        <Link
                            to="/admin/login"
                            className="hidden rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 md:block"
                        >
                            Admin Sign In
                        </Link>
                    )}

                    {/* =================================================
                        MOBILE MENU BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        onClick={
                            toggleMobileMenu
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
                        aria-label="Toggle admin menu"
                        aria-expanded={
                            mobileOpen
                        }
                    >

                        {mobileOpen ? (
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        ) : (
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M4 7h16M4 12h16M4 17h16" />
                            </svg>
                        )}

                    </button>

                </div>

            </nav>

            {/* =================================================
                MOBILE MENU
            ================================================= */}

            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white md:hidden">

                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        {/* ADMIN CARD */}

                        {Admin && (
                            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-900 p-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-900">
                                    {adminInitial}
                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm font-bold text-white">
                                        {adminDisplayName ||
                                            "Admin"}
                                    </p>

                                    <p className="truncate text-xs text-slate-400">
                                        {Admin?.email ||
                                            "Administrator"}
                                    </p>

                                </div>

                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase text-emerald-400">

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                    Live

                                </span>

                            </div>
                        )}

                        {/* =================================================
                            MOBILE NAVIGATION
                        ================================================= */}

                        <div className="grid gap-2">

                            {navItems.map((item) => {
                                const active =
                                    isActive(
                                        item.path
                                    );

                                return (
                                    <Link
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        onClick={
                                            handleMobileNavigation
                                        }
                                        className={`
                                            flex items-center gap-3
                                            rounded-2xl px-4 py-3.5
                                            text-sm font-semibold
                                            transition
                                            ${
                                                active
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                            }
                                        `}
                                    >

                                        <span
                                            className={
                                                active
                                                    ? "text-amber-400"
                                                    : "text-slate-400"
                                            }
                                        >
                                            {item.icon}
                                        </span>

                                        <span>
                                            {item.name}
                                        </span>

                                        {active && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-amber-400" />
                                        )}

                                    </Link>
                                );
                            })}

                        </div>

                        {/* =================================================
                            MOBILE ACTIONS
                        ================================================= */}

                        <div className="mt-4 grid grid-cols-2 gap-2">

                            <Link
                                to="/admin"
                                onClick={
                                    handleMobileNavigation
                                }
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Admin Home
                            </Link>

                            {Admin ? (
                                <button
                                    type="button"
                                    onClick={
                                        handleAdminLogout
                                    }
                                    className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/admin/login"
                                    onClick={
                                        handleMobileNavigation
                                    }
                                    className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-xs font-bold text-white"
                                >
                                    Sign In
                                </Link>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </header>
    );
};

export default AdminNavbar;
