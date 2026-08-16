import React, {
    useCallback,
    useContext,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
    UserDataContext,
} from "../Context/UserDataContext.js";

import {
    OrderDataContext,
} from "../Context/OrderDataContext.js";

import useThrottle from "../Hooks/useThrottle";


const UserNavbar = () => {
    const [userMenuOpen, setUserMenuOpen] =
        useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [loggingOut, setLoggingOut] =
        useState(false);

    const {
        user,
        setUser,
    } = useContext(UserDataContext);

    const {
        cartCount,
    } = useContext(OrderDataContext);

    const navigate = useNavigate();


    // =========================================================
    // DISPLAY NAME
    // =========================================================

    const displayName =
        user?.fullname ||
        user?.fullName ||
        user?.name ||
        (user?.email
            ? user.email.split("@")[0]
            : "");

    const firstLetter =
        displayName
            ? displayName.charAt(0).toUpperCase()
            : "U";


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = useCallback(
        async () => {
            if (loggingOut) {
                return;
            }

            setLoggingOut(true);

            try {
                const token =
                    localStorage.getItem("token");

                if (token) {
                    await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/users/logout`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );
                }
            } catch {
                // Local logout continues even if
                // the server request fails.
            } finally {
                localStorage.removeItem("token");

                setUser(null);

                setUserMenuOpen(false);

                setMobileMenuOpen(false);

                setLoggingOut(false);

                navigate("/login", {
                    replace: true,
                });
            }
        },
        [
            loggingOut,
            navigate,
            setUser,
        ]
    );


    // =========================================================
    // THROTTLED LOGOUT
    // =========================================================
    // Only one logout attempt can start within 1500ms.

    const throttledLogout = useThrottle(
        handleLogout,
        1500
    );


    // =========================================================
    // MOBILE MENU
    // =========================================================

    const toggleMobileMenu = useCallback(
        () => {
            setMobileMenuOpen(
                (previous) => !previous
            );
        },
        []
    );


    // =========================================================
    // THROTTLED MOBILE MENU
    // =========================================================
    // Prevents multiple rapid clicks on hamburger.

    const throttledMobileMenu = useThrottle(
        toggleMobileMenu,
        300
    );


    // =========================================================
    // NAVIGATION CLICK
    // =========================================================

    const handleNavClick = useCallback(
        () => {
            setMobileMenuOpen(false);
            setUserMenuOpen(false);
        },
        []
    );


    // =========================================================
    // NAV LINK COMPONENT
    // =========================================================

    const NavItem = ({
        to,
        children,
    }) => {
        return (
            <Link
                to={to}
                onClick={handleNavClick}
                className="
                    group
                    relative
                    flex
                    items-center
                    rounded-xl
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    duration-200
                    hover:bg-slate-100
                    hover:text-slate-950
                "
            >
                {children}

                <span
                    className="
                        absolute
                        bottom-1
                        left-3
                        right-3
                        h-0.5
                        origin-left
                        scale-x-0
                        rounded-full
                        bg-slate-900
                        transition-transform
                        duration-200
                        group-hover:scale-x-100
                    "
                />
            </Link>
        );
    };


    return (
        <>
            <header
                className="
                    sticky
                    top-0
                    z-50
                    w-full
                    border-b
                    border-slate-200/80
                    bg-white/90
                    shadow-sm
                    backdrop-blur-xl
                "
            >

                <nav
                    className="
                        mx-auto
                        flex
                        h-[72px]
                        max-w-7xl
                        items-center
                        justify-between
                        px-4
                        sm:px-6
                        lg:px-8
                    "
                >

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <Link
                        to="/"
                        onClick={handleNavClick}
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                        "
                    >
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-2xl
                                bg-slate-900
                                text-white
                                shadow-sm
                                transition
                                duration-200
                                hover:scale-105
                            "
                        >
                            <span
                                className="
                                    text-sm
                                    font-black
                                    tracking-tight
                                "
                            >
                                SN
                            </span>
                        </div>

                        <div
                            className="
                                hidden
                                leading-tight
                                sm:block
                            "
                        >
                            <p
                                className="
                                    text-sm
                                    font-black
                                    tracking-tight
                                    text-slate-950
                                "
                            >
                                StyleNest
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-slate-400
                                "
                            >
                                Style & Trends
                            </p>
                        </div>
                    </Link>


                    {/* =================================================
                        DESKTOP NAVIGATION
                    ================================================= */}

                    <div
                        className="
                            hidden
                            items-center
                            gap-1
                            lg:flex
                        "
                    >
                        <NavItem to="/">
                            Home
                        </NavItem>

                        <NavItem to="/breakfast">
                            Women
                        </NavItem>

                        <NavItem to="/lunch">
                            Men
                        </NavItem>

                        <NavItem to="/dinner">
                            Kids
                        </NavItem>

                        <NavItem to="/favorites">
                            Favorites
                        </NavItem>
                    </div>


                    {/* =================================================
                        DESKTOP RIGHT SIDE
                    ================================================= */}

                    <div
                        className="
                            hidden
                            items-center
                            gap-3
                            md:flex
                        "
                    >

                        {/* MY ORDERS */}

                        <Link
                            to="/myorders"
                            onClick={handleNavClick}
                            className="
                                group
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3.5
                                py-2.5
                                text-xs
                                font-bold
                                text-slate-700
                                shadow-sm
                                transition
                                duration-200
                                hover:border-slate-300
                                hover:bg-slate-50
                                hover:text-slate-950
                            "
                        >
                            <svg
                                className="
                                    h-4
                                    w-4
                                    text-slate-500
                                    transition
                                    group-hover:text-slate-900
                                "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M6 2h9l3 3v17H6z" />
                                <path d="M9 10h6M9 14h6M9 18h4" />
                            </svg>

                            My Orders
                        </Link>


                        {/* ADDRESS */}

                        <Link
                            to="/addresses"
                            onClick={handleNavClick}
                            className="
                                group
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3.5
                                py-2.5
                                text-xs
                                font-bold
                                text-slate-700
                                shadow-sm
                                transition
                                duration-200
                                hover:border-slate-300
                                hover:bg-slate-50
                                hover:text-slate-950
                            "
                        >
                            <svg
                                className="
                                    h-4
                                    w-4
                                    text-slate-500
                                    transition
                                    group-hover:text-slate-900
                                "
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                                />

                                <circle
                                    cx="12"
                                    cy="10"
                                    r="2.5"
                                />
                            </svg>

                            Address
                        </Link>


                        {/* USER */}

                        {user ? (
                            <div className="relative">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setUserMenuOpen(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2.5
                                        rounded-full
                                        border
                                        border-slate-200
                                        bg-white
                                        py-1.5
                                        pl-1.5
                                        pr-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        shadow-sm
                                        transition
                                        duration-200
                                        hover:bg-slate-50
                                    "
                                >
                                    <span
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-slate-900
                                            text-xs
                                            font-black
                                            text-white
                                        "
                                    >
                                        {firstLetter}
                                    </span>

                                    <span
                                        className="
                                            max-w-[90px]
                                            truncate
                                        "
                                    >
                                        {displayName || "User"}
                                    </span>

                                    <svg
                                        className={`
                                            h-4
                                            w-4
                                            text-slate-400
                                            transition-transform
                                            duration-200
                                            ${
                                                userMenuOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>


                                {/* USER DROPDOWN */}

                                {userMenuOpen && (
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            mt-3
                                            w-72
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            shadow-xl
                                        "
                                    >

                                        {/* USER HEADER */}

                                        <div
                                            className="
                                                border-b
                                                border-slate-100
                                                bg-slate-50
                                                p-4
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                "
                                            >
                                                <span
                                                    className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-slate-900
                                                        text-sm
                                                        font-black
                                                        text-white
                                                    "
                                                >
                                                    {firstLetter}
                                                </span>

                                                <div className="min-w-0">
                                                    <p
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-bold
                                                            text-slate-900
                                                        "
                                                    >
                                                        {displayName || "User"}
                                                    </p>

                                                    <p
                                                        className="
                                                            truncate
                                                            text-xs
                                                            text-slate-500
                                                        "
                                                    >
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>


                                        {/* MENU */}

                                        <div className="p-2">

                                            <Link
                                                to="/myorders"
                                                onClick={handleNavClick}
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-3
                                                    py-3
                                                    text-sm
                                                    font-semibold
                                                    text-slate-700
                                                    transition
                                                    hover:bg-slate-100
                                                "
                                            >
                                                <span
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-slate-100
                                                    "
                                                >
                                                    📦
                                                </span>

                                                <div>
                                                    <p>
                                                        My Orders
                                                    </p>

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            font-normal
                                                            text-slate-400
                                                        "
                                                    >
                                                        Track your purchases
                                                    </p>
                                                </div>
                                            </Link>


                                            <Link
                                                to="/addresses"
                                                onClick={handleNavClick}
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-3
                                                    py-3
                                                    text-sm
                                                    font-semibold
                                                    text-slate-700
                                                    transition
                                                    hover:bg-slate-100
                                                "
                                            >
                                                <span
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-slate-100
                                                    "
                                                >
                                                    📍
                                                </span>

                                                <div>
                                                    <p>
                                                        Address Details
                                                    </p>

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            font-normal
                                                            text-slate-400
                                                        "
                                                    >
                                                        Manage delivery addresses
                                                    </p>
                                                </div>
                                            </Link>


                                            <Link
                                                to="/favorites"
                                                onClick={handleNavClick}
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-3
                                                    py-3
                                                    text-sm
                                                    font-semibold
                                                    text-slate-700
                                                    transition
                                                    hover:bg-slate-100
                                                "
                                            >
                                                <span
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-slate-100
                                                    "
                                                >
                                                    ♡
                                                </span>

                                                <div>
                                                    <p>
                                                        Favorites
                                                    </p>

                                                    <p
                                                        className="
                                                            text-[10px]
                                                            font-normal
                                                            text-slate-400
                                                        "
                                                    >
                                                        Your saved products
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>


                                        {/* LOGOUT */}

                                        <div
                                            className="
                                                border-t
                                                border-slate-100
                                                p-2
                                            "
                                        >
                                            <button
                                                type="button"
                                                onClick={throttledLogout}
                                                disabled={loggingOut}
                                                className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-3
                                                    py-3
                                                    text-left
                                                    text-sm
                                                    font-bold
                                                    text-red-600
                                                    transition
                                                    hover:bg-red-50
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                <span
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-red-50
                                                    "
                                                >
                                                    {loggingOut
                                                        ? "..."
                                                        : "↪"}
                                                </span>

                                                {loggingOut
                                                    ? "Logging out..."
                                                    : "Logout"}
                                            </button>
                                        </div>

                                    </div>
                                )}

                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={handleNavClick}
                                className="
                                    rounded-xl
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-slate-100
                                "
                            >
                                Sign in
                            </Link>
                        )}


                        {/* CART */}

                        <Link
                            to="/favorites"
                            onClick={handleNavClick}
                            className="
                                relative
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-slate-900
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                                shadow-sm
                                transition
                                duration-200
                                hover:bg-slate-800
                            "
                        >
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M6 7h12l1 13H5L6 7Z" />
                                <path d="M9 7a3 3 0 0 1 6 0" />
                            </svg>

                            Cart

                            {cartCount > 0 && (
                                <span
                                    className="
                                        absolute
                                        -right-2
                                        -top-2
                                        flex
                                        min-h-5
                                        min-w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-amber-400
                                        px-1
                                        text-[9px]
                                        font-black
                                        text-slate-950
                                        ring-2
                                        ring-white
                                    "
                                >
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                    </div>


                    {/* =================================================
                        MOBILE RIGHT SIDE
                    ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            md:hidden
                        "
                    >

                        {/* MOBILE CART */}

                        <Link
                            to="/cart"
                            onClick={handleNavClick}
                            className="
                                relative
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-slate-900
                                text-white
                            "
                            aria-label="Cart"
                        >
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M6 7h12l1 13H5L6 7Z" />
                                <path d="M9 7a3 3 0 0 1 6 0" />
                            </svg>

                            {cartCount > 0 && (
                                <span
                                    className="
                                        absolute
                                        -right-1
                                        -top-1
                                        flex
                                        h-5
                                        min-w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-amber-400
                                        px-1
                                        text-[9px]
                                        font-black
                                        text-slate-950
                                    "
                                >
                                    {cartCount}
                                </span>
                            )}
                        </Link>


                        {/* MOBILE MENU */}

                        <button
                            type="button"
                            onClick={throttledMobileMenu}
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-slate-200
                                bg-white
                                text-slate-700
                                shadow-sm
                            "
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
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


                {/* =====================================================
                    MOBILE MENU
                ===================================================== */}

                {mobileMenuOpen && (
                    <div
                        className="
                            border-t
                            border-slate-100
                            bg-white
                            md:hidden
                        "
                    >
                        <div
                            className="
                                mx-auto
                                max-w-7xl
                                px-4
                                py-4
                                sm:px-6
                            "
                        >

                            {/* USER CARD */}

                            {user ? (
                                <div
                                    className="
                                        mb-4
                                        flex
                                        items-center
                                        justify-between
                                        rounded-2xl
                                        bg-slate-50
                                        p-4
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >
                                        <span
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-slate-900
                                                text-xs
                                                font-black
                                                text-white
                                            "
                                        >
                                            {firstLetter}
                                        </span>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {displayName || "User"}
                                            </p>

                                            <p
                                                className="
                                                    max-w-[190px]
                                                    truncate
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={handleNavClick}
                                    className="
                                        mb-4
                                        block
                                        rounded-xl
                                        bg-slate-900
                                        px-4
                                        py-3
                                        text-center
                                        text-sm
                                        font-bold
                                        text-white
                                    "
                                >
                                    Sign in
                                </Link>
                            )}


                            {/* MAIN NAVIGATION */}

                            <div className="grid grid-cols-2 gap-2">

                                <Link
                                    to="/"
                                    onClick={handleNavClick}
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        p-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        shadow-sm
                                    "
                                >
                                    🏠 Home
                                </Link>

                                <Link
                                    to="/breakfast"
                                    onClick={handleNavClick}
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        p-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        shadow-sm
                                    "
                                >
                                    👗 Women
                                </Link>

                                <Link
                                    to="/lunch"
                                    onClick={handleNavClick}
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        p-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        shadow-sm
                                    "
                                >
                                    👔 Men
                                </Link>

                                <Link
                                    to="/dinner"
                                    onClick={handleNavClick}
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        p-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        shadow-sm
                                    "
                                >
                                    🧸 Kids
                                </Link>

                            </div>


                            {/* ACCOUNT OPTIONS */}

                            {user && (
                                <div className="mt-3 space-y-2">

                                    <Link
                                        to="/myorders"
                                        onClick={handleNavClick}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            font-bold
                                            text-slate-700
                                            shadow-sm
                                        "
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-slate-100
                                                "
                                            >
                                                📦
                                            </span>

                                            My Orders
                                        </span>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </Link>


                                    <Link
                                        to="/addresses"
                                        onClick={handleNavClick}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            font-bold
                                            text-slate-700
                                            shadow-sm
                                        "
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-slate-100
                                                "
                                            >
                                                📍
                                            </span>

                                            Address Details
                                        </span>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </Link>


                                    <Link
                                        to="/favorites"
                                        onClick={handleNavClick}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            font-bold
                                            text-slate-700
                                            shadow-sm
                                        "
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    bg-slate-100
                                                "
                                            >
                                                ♡
                                            </span>

                                            Favorites
                                        </span>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </Link>


                                    {/* LOGOUT */}

                                    <button
                                        type="button"
                                        onClick={throttledLogout}
                                        disabled={loggingOut}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            border
                                            border-red-100
                                            bg-red-50
                                            px-4
                                            py-3
                                            text-left
                                            text-sm
                                            font-bold
                                            text-red-600
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        <span
                                            className="
                                                flex
                                                h-8
                                                w-8
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-white
                                            "
                                        >
                                            {loggingOut
                                                ? "..."
                                                : "↪"}
                                        </span>

                                        {loggingOut
                                            ? "Logging out..."
                                            : "Logout"}
                                    </button>

                                </div>
                            )}

                        </div>
                    </div>
                )}

            </header>
        </>
    );
};


export default UserNavbar;
