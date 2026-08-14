import React, {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
    AdminDataContext,
} from "../Context/AdminDataContext.js";


const AdminProtectedWrapper = ({
    children,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        setAdmin,
    } = useContext(AdminDataContext);

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);


    useEffect(() => {
        let mounted = true;

        const checkAdminAuth = async () => {
            const token =
                localStorage.getItem(
                    "adminToken"
                );

            // -----------------------------------------
            // NO TOKEN
            // -----------------------------------------

            if (!token) {
                if (mounted) {
                    setAuthenticated(false);
                    setAdmin(null);
                    setCheckingAuth(false);
                }

                navigate("/admin/login", {
                    replace: true,
                    state: {
                        from:
                            location.pathname,
                    },
                });

                return;
            }


            // -----------------------------------------
            // VERIFY TOKEN WITH BACKEND
            // -----------------------------------------

            try {
                const response =
                    await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/v1/admins/profile`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (
                    !response.data?.success &&
                    response.status !== 200
                ) {
                    throw new Error(
                        "Admin authentication failed"
                    );
                }


                const admin =
                    response.data?.data;


                if (!admin) {
                    throw new Error(
                        "Admin data not found"
                    );
                }


                if (mounted) {
                    setAdmin(admin);
                    setAuthenticated(true);
                    setCheckingAuth(false);
                }

            } catch (error) {

                console.error(
                    "Admin authentication error:",
                    error
                );


                // -------------------------------------
                // INVALID TOKEN
                // -------------------------------------

                localStorage.removeItem(
                    "adminToken"
                );

                if (mounted) {
                    setAdmin(null);
                    setAuthenticated(false);
                    setCheckingAuth(false);
                }


                navigate("/admin/login", {
                    replace: true,
                    state: {
                        from:
                            location.pathname,
                    },
                });
            }
        };


        checkAdminAuth();


        return () => {
            mounted = false;
        };

    }, [
        navigate,
        location.pathname,
        setAdmin,
    ]);


    // ---------------------------------------------
    // AUTH CHECKING
    // ---------------------------------------------

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">

                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                        Checking admin access...
                    </p>

                </div>

            </div>
        );
    }


    // ---------------------------------------------
    // NOT AUTHENTICATED
    // ---------------------------------------------

    if (!authenticated) {
        return null;
    }


    // ---------------------------------------------
    // AUTHENTICATED
    // ---------------------------------------------

    return children;
};


export default AdminProtectedWrapper;