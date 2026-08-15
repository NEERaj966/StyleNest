import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const emptyForm = {
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "Home",
    isDefault: false,
};

const AddressPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [message, setMessage] = useState({
        type: "",
        text: "",
    });

    const [deleteId, setDeleteId] = useState(null);

    // =========================================================
    // AXIOS INSTANCE
    // =========================================================

    const api = axios.create({
        baseURL: `${BASE_URL}/api/v1/addressesDetail`,
        withCredentials: true,
    });

    // =========================================================
    // AUTH CONFIG
    // =========================================================

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        };
    };

    // =========================================================
    // FETCH ADDRESSES
    // =========================================================

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setMessage({
                type: "",
                text: "",
            });

            const token = localStorage.getItem("token");

            // -------------------------------------------------
            // USER NOT LOGGED IN
            // -------------------------------------------------

            if (!token) {
                setAddresses([]);

                setMessage({
                    type: "error",
                    text: "Please login to manage your addresses.",
                });

                return;
            }

            // -------------------------------------------------
            // GET ALL ADDRESSES
            // GET /api/v1/addressesDetail/
            // -------------------------------------------------

            const response = await api.get(
                "/",
                getAuthConfig()
            );


            const data = response?.data?.data;

            let addressList = [];

            if (Array.isArray(data)) {
                addressList = data;
            } else if (Array.isArray(data?.addresses)) {
                addressList = data.addresses;
            } else if (
                Array.isArray(response?.data?.addresses)
            ) {
                addressList = response.data.addresses;
            } else if (
                Array.isArray(data?.items)
            ) {
                addressList = data.items;
            }

            setAddresses(addressList);

        } catch (error) {
            console.error(
                "Fetch addresses error:",
                error
            );

            console.error(
                "Request URL:",
                error?.config?.url
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            // -------------------------------------------------
            // UNAUTHORIZED
            // -------------------------------------------------

            if (error?.response?.status === 401) {
                setAddresses([]);

                setMessage({
                    type: "error",
                    text: "Your session has expired. Please login again.",
                });

                return;
            }

            // -------------------------------------------------
            // OTHER ERROR
            // -------------------------------------------------

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Unable to load your addresses.",
            });

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchAddresses();
    }, []);

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const handleAddAddress = () => {
        setEditingAddress(null);

        setForm({
            ...emptyForm,
            isDefault: addresses.length === 0,
        });

        setMessage({
            type: "",
            text: "",
        });

        setShowModal(true);
    };

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const handleEditAddress = (address) => {
        setEditingAddress(address);

        setForm({
            name: address.name || "",
            phone: address.phone || "",
            addressLine1:
                address.addressLine1 || "",
            addressLine2:
                address.addressLine2 || "",
            city: address.city || "",
            state: address.state || "",
            pincode: address.pincode || "",
            landmark: address.landmark || "",
            type: address.type || "Home",
            isDefault: Boolean(
                address.isDefault
            ),
        });

        setMessage({
            type: "",
            text: "",
        });

        setShowModal(true);
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingAddress(null);
        setForm(emptyForm);
    };

    // =========================================================
    // VALIDATE FORM
    // =========================================================

    const validateForm = () => {
        if (!form.name.trim()) {
            return "Please enter your name.";
        }

        if (!form.phone.trim()) {
            return "Please enter your phone number.";
        }

        if (!/^[0-9]{10}$/.test(form.phone.trim())) {
            return "Please enter a valid 10-digit phone number.";
        }

        if (!form.addressLine1.trim()) {
            return "Please enter address line 1.";
        }

        if (!form.city.trim()) {
            return "Please enter your city.";
        }

        if (!form.state.trim()) {
            return "Please enter your state.";
        }

        if (!form.pincode.trim()) {
            return "Please enter your pincode.";
        }

        if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
            return "Please enter a valid 6-digit pincode.";
        }

        return null;
    };

    // =========================================================
    // SUBMIT ADDRESS
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {
            setMessage({
                type: "error",
                text: validationError,
            });

            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            setMessage({
                type: "error",
                text: "Please login to save your address.",
            });

            return;
        }

        try {
            setSaving(true);

            setMessage({
                type: "",
                text: "",
            });

            let response;

            // =================================================
            // UPDATE ADDRESS
            // PUT /api/v1/addressesDetail/:id
            // =================================================

            if (editingAddress) {
                response = await api.put(
                    `/${editingAddress._id}`,
                    form,
                    getAuthConfig()
                );

                console.log(
                    "Address updated:",
                    response.data
                );

                setMessage({
                    type: "success",
                    text: "Address updated successfully.",
                });
            }

            // =================================================
            // CREATE ADDRESS
            // POST /api/v1/addressesDetail/
            // =================================================

            else {
                response = await api.post(
                    "/",
                    form,
                    getAuthConfig()
                );

                console.log(
                    "Address created:",
                    response.data
                );

                setMessage({
                    type: "success",
                    text: "Address added successfully.",
                });
            }

            // =================================================
            // REFRESH ADDRESS LIST
            // =================================================

            await fetchAddresses();

            // =================================================
            // CLOSE MODAL
            // =================================================

            setShowModal(false);
            setEditingAddress(null);
            setForm(emptyForm);

        } catch (error) {
            console.error(
                "Save address error:",
                error
            );

            console.error(
                "Request URL:",
                error?.config?.url
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            if (
                error?.response?.status ===
                401
            ) {
                setMessage({
                    type: "error",
                    text: "Your session has expired. Please login again.",
                });

                return;
            }

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Unable to save address.",
            });

        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // SET DEFAULT ADDRESS
    // =========================================================

    const handleSetDefault = async (id) => {
        if (!id) return;

        const token =
            localStorage.getItem("token");

        if (!token) {
            setMessage({
                type: "error",
                text: "Please login first.",
            });

            return;
        }

        try {
            setMessage({
                type: "",
                text: "",
            });

            const response =
                await api.patch(
                    `/${id}/default`,
                    {},
                    getAuthConfig()
                );

            console.log(
                "Default address response:",
                response.data
            );

            setMessage({
                type: "success",
                text: "Default address updated.",
            });

            await fetchAddresses();

        } catch (error) {
            console.error(
                "Set default error:",
                error
            );

            console.error(
                "Request URL:",
                error?.config?.url
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            if (
                error?.response?.status ===
                401
            ) {
                setMessage({
                    type: "error",
                    text: "Your session has expired. Please login again.",
                });

                return;
            }

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Unable to set default address.",
            });
        }
    };

    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    const handleDelete = async () => {
        if (!deleteId) return;

        const token =
            localStorage.getItem("token");

        if (!token) {
            setMessage({
                type: "error",
                text: "Please login first.",
            });

            setDeleteId(null);

            return;
        }

        try {
            const response =
                await api.delete(
                    `/${deleteId}`,
                    getAuthConfig()
                );

            console.log(
                "Address deleted:",
                response.data
            );

            setMessage({
                type: "success",
                text: "Address deleted successfully.",
            });

            setDeleteId(null);

            await fetchAddresses();

        } catch (error) {
            console.error(
                "Delete address error:",
                error
            );

            console.error(
                "Request URL:",
                error?.config?.url
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            if (
                error?.response?.status ===
                401
            ) {
                setMessage({
                    type: "error",
                    text: "Your session has expired. Please login again.",
                });

                return;
            }

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Unable to delete address.",
            });
        }
    };

    // =========================================================
    // ICONS
    // =========================================================

    const HomeIcon = () => (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9 21v-6h6v6" />
        </svg>
    );

    const BriefcaseIcon = () => (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect
                x="3"
                y="7"
                width="18"
                height="13"
                rx="2"
            />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M3 12h18" />
        </svg>
    );

    const MapPinIcon = () => (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle
                cx="12"
                cy="10"
                r="2.5"
            />
        </svg>
    );

    const PhoneIcon = () => (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
        </svg>
    );

    const PencilIcon = () => (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    );

    const TrashIcon = () => (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
        </svg>
    );

    const PlusIcon = () => (
        <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );

    // =========================================================
    // ADDRESS TYPE ICON
    // =========================================================

    const AddressTypeIcon = ({ type }) => {
        if (type === "Work") {
            return <BriefcaseIcon />;
        }

        if (type === "Other") {
            return <MapPinIcon />;
        }

        return <HomeIcon />;
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f7f5] px-4 py-10">
                <div className="mx-auto max-w-6xl animate-pulse">
                    <div className="mb-10 h-10 w-64 rounded-xl bg-[#d9d0c4]" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-64 rounded-xl bg-[#f8f4ec] shadow-[0_3px_12px_rgba(36,33,29,0.04)]"
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-[#f7f7f5]">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-black/5 bg-[#f8f4ec]">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                                Account
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-[#24211d] sm:text-4xl">
                                My Addresses
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#746b61]">
                                Manage your saved delivery addresses and choose where
                                your orders should be delivered.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-[#f8f4ec] shadow-[0_10px_28px_rgba(36,33,29,0.06)] shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-orange-600"
                        >
                            <PlusIcon />
                            Add New Address
                        </button>

                    </div>

                </div>
            </div>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message.text && (
                    <div
                        className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                            message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        <div
                            className={`h-2 w-2 rounded-full ${
                                message.type === "success"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                            }`}
                        />

                        <span>
                            {message.text}
                        </span>
                    </div>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {addresses.length === 0 ? (
                    <div className="flex min-h-[520px] items-center justify-center">

                        <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-[#f8f4ec] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-10">

                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                                <svg
                                    width="34"
                                    height="34"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                    <circle
                                        cx="12"
                                        cy="10"
                                        r="2.5"
                                    />
                                </svg>

                            </div>

                            <h2 className="text-xl font-bold text-[#24211d]">
                                No saved addresses
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#746b61]">
                                Add your delivery address so you can place orders
                                faster.
                            </p>

                            <button
                                type="button"
                                onClick={handleAddAddress}
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-[#f8f4ec] transition hover:bg-orange-700"
                            >
                                <PlusIcon />
                                Add Your First Address
                            </button>

                        </div>

                    </div>
                ) : (
                    <>
                        {/* =================================================
                            SECTION HEADER
                        ================================================= */}

                        <div className="mb-5 flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-bold text-[#24211d]">
                                    Saved Addresses
                                </h2>

                                <p className="mt-1 text-sm text-[#746b61]">
                                    {addresses.length}{" "}
                                    {addresses.length === 1
                                        ? "address"
                                        : "addresses"}{" "}
                                    saved
                                </p>
                            </div>

                        </div>

                        {/* =================================================
                            ADDRESS GRID
                        ================================================= */}

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                            {addresses.map(
                                (address) => (
                                    <div
                                        key={
                                            address._id
                                        }
                                        className={`group relative overflow-hidden rounded-[1.75rem] border bg-[#f8f4ec] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${
                                            address.isDefault
                                                ? "border-orange-200 ring-1 ring-orange-100"
                                                : "border-black/5"
                                        }`}
                                    >

                                        {/* TOP LINE */}

                                        <div
                                            className={`absolute left-0 right-0 top-0 h-1 ${
                                                address.isDefault
                                                    ? "bg-orange-500"
                                                    : "bg-transparent group-hover:bg-orange-200"
                                            }`}
                                        />

                                        {/* HEADER */}

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                                        address.isDefault
                                                            ? "bg-orange-100 text-orange-600"
                                                            : "bg-[#e5ded3] text-[#5d554c]"
                                                    }`}
                                                >
                                                    <AddressTypeIcon
                                                        type={
                                                            address.type
                                                        }
                                                    />
                                                </div>

                                                <div>

                                                    <div className="flex items-center gap-2">

                                                        <h3 className="font-bold text-[#24211d]">
                                                            {
                                                                address.name
                                                            }
                                                        </h3>

                                                        {address.isDefault && (
                                                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                                                                Default
                                                            </span>
                                                        )}

                                                    </div>

                                                    <p className="mt-0.5 text-xs font-medium text-[#746b61]">
                                                        {
                                                            address.type ||
                                                            "Home"
                                                        }{" "}
                                                        Address
                                                    </p>

                                                </div>

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="flex items-center gap-1">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditAddress(
                                                            address
                                                        )
                                                    }
                                                    className="rounded-xl p-2.5 text-[#746b61] transition hover:bg-[#e5ded3] hover:text-[#24211d]"
                                                    title="Edit address"
                                                >
                                                    <PencilIcon />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteId(
                                                            address._id
                                                        )
                                                    }
                                                    className="rounded-xl p-2.5 text-[#746b61] transition hover:bg-red-50 hover:text-red-600"
                                                    title="Delete address"
                                                >
                                                    <TrashIcon />
                                                </button>

                                            </div>

                                        </div>

                                        {/* ADDRESS */}

                                        <div className="mt-6 space-y-2 text-sm leading-6 text-[#5d554c]">

                                            <div className="flex items-start gap-2.5">

                                                <MapPinIcon />

                                                <p>
                                                    {
                                                        address.addressLine1
                                                    }

                                                    {address.addressLine2 && (
                                                        <>
                                                            <br />
                                                            {
                                                                address.addressLine2
                                                            }
                                                        </>
                                                    )}

                                                    <br />

                                                    {
                                                        address.city
                                                    }
                                                    ,{" "}
                                                    {
                                                        address.state
                                                    }{" "}
                                                    -{" "}

                                                    <span className="font-semibold text-[#302b26]">
                                                        {
                                                            address.pincode
                                                        }
                                                    </span>

                                                    {address.landmark && (
                                                        <>
                                                            <br />

                                                            <span className="text-[#746b61]">
                                                                Landmark:{" "}
                                                                {
                                                                    address.landmark
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                </p>

                                            </div>

                                            <div className="flex items-center gap-2.5 pt-1">

                                                <PhoneIcon />

                                                <span className="font-medium text-[#3e3730]">
                                                    {
                                                        address.phone
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                        {/* FOOTER */}

                                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">

                                            <span className="text-xs text-[#877d72]">
                                                {address.isDefault
                                                    ? "Used for faster checkout"
                                                    : "Saved delivery address"}
                                            </span>

                                            {!address.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSetDefault(
                                                            address._id
                                                        )
                                                    }
                                                    className="text-xs font-bold text-orange-600 transition hover:text-orange-700"
                                                >
                                                    Set as default
                                                </button>
                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    </>
                )}

            </main>

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24211d]/50 p-4 backdrop-blur-sm">

                    <div
                        className="absolute inset-0"
                        onClick={closeModal}
                    />

                    <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-[#f8f4ec] shadow-[0_18px_50px_rgba(36,33,29,0.08)]">

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 border-b border-gray-100 bg-[#f8f4ec] px-6 py-5 sm:px-7">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                                        Delivery
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-[#24211d]">
                                        {editingAddress
                                            ? "Edit Address"
                                            : "Add New Address"}
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5ded3] text-xl text-[#746b61] transition hover:bg-[#d9d0c4] hover:text-[#24211d] disabled:opacity-50"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-6 p-6 sm:p-7"
                        >

                            {/* NAME + PHONE */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                        Full Name *
                                    </label>

                                    <input
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter full name"
                                        autoComplete="name"
                                        className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm text-[#24211d] outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                        Phone Number *
                                    </label>

                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10-digit phone number"
                                        inputMode="numeric"
                                        maxLength={10}
                                        autoComplete="tel"
                                        className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm text-[#24211d] outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                    />

                                </div>

                            </div>

                            {/* ADDRESS LINE 1 */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                    Address Line 1 *
                                </label>

                                <input
                                    name="addressLine1"
                                    value={
                                        form.addressLine1
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="House / Flat / Building / Street"
                                    autoComplete="address-line1"
                                    className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm text-[#24211d] outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                />

                            </div>

                            {/* ADDRESS LINE 2 */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-[#302b26]">

                                    Address Line 2

                                    <span className="ml-1 font-normal text-[#877d72]">
                                        (Optional)
                                    </span>

                                </label>

                                <input
                                    name="addressLine2"
                                    value={
                                        form.addressLine2
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Apartment, floor, area, etc."
                                    autoComplete="address-line2"
                                    className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm text-[#24211d] outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                />

                            </div>

                            {/* CITY STATE PINCODE */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                        City *
                                    </label>

                                    <input
                                        name="city"
                                        value={
                                            form.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="City"
                                        autoComplete="address-level2"
                                        className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                        State *
                                    </label>

                                    <input
                                        name="state"
                                        value={
                                            form.state
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="State"
                                        autoComplete="address-level1"
                                        className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-[#302b26]">
                                        Pincode *
                                    </label>

                                    <input
                                        name="pincode"
                                        value={
                                            form.pincode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="6-digit pincode"
                                        inputMode="numeric"
                                        maxLength={6}
                                        autoComplete="postal-code"
                                        className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                    />

                                </div>

                            </div>

                            {/* LANDMARK */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-[#302b26]">

                                    Landmark

                                    <span className="ml-1 font-normal text-[#877d72]">
                                        (Optional)
                                    </span>

                                </label>

                                <input
                                    name="landmark"
                                    value={
                                        form.landmark
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nearby landmark"
                                    className="w-full rounded-xl border border-[#d5cec2] bg-[#eee8de] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#877d72] focus:border-orange-500 focus:bg-[#f8f4ec] focus:ring-4 focus:ring-orange-500/10"
                                />

                            </div>

                            {/* ADDRESS TYPE */}

                            <div>

                                <label className="mb-3 block text-sm font-semibold text-[#302b26]">
                                    Address Type
                                </label>

                                <div className="grid grid-cols-3 gap-3">

                                    {[
                                        "Home",
                                        "Work",
                                        "Other",
                                    ].map(
                                        (type) => (
                                            <button
                                                key={
                                                    type
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setForm(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            type,
                                                        })
                                                    )
                                                }
                                                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                                    form.type ===
                                                    type
                                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                                        : "border-[#d5cec2] bg-[#eee8de] text-[#5d554c] hover:border-[#c9c0b4]"
                                                }`}
                                            >
                                                <AddressTypeIcon
                                                    type={
                                                        type
                                                    }
                                                />

                                                {
                                                    type
                                                }
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                            {/* DEFAULT CHECKBOX */}

                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d5cec2] bg-[#eee8de] p-4">

                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={
                                        form.isDefault
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="mt-0.5 h-4 w-4 accent-orange-600"
                                />

                                <span>

                                    <span className="block text-sm font-semibold text-[#24211d]">
                                        Set as default address
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-[#746b61]">
                                        Use this address automatically during checkout.
                                    </span>

                                </span>

                            </label>

                            {/* BUTTONS */}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-[#d5cec2] px-5 py-3.5 text-sm font-semibold text-[#3e3730] transition hover:bg-[#eee8de] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-[#f8f4ec] shadow-[0_10px_28px_rgba(36,33,29,0.06)] shadow-gray-900/10 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingAddress
                                        ? "Update Address"
                                        : "Save Address"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#24211d]/50 p-4 backdrop-blur-sm">

                    <div
                        className="absolute inset-0"
                        onClick={() =>
                            setDeleteId(null)
                        }
                    />

                    <div className="relative z-10 w-full max-w-sm rounded-[2rem] bg-[#f8f4ec] p-7 shadow-[0_18px_50px_rgba(36,33,29,0.08)]">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <TrashIcon />
                        </div>

                        <h3 className="mt-5 text-center text-xl font-bold text-[#24211d]">
                            Delete address?
                        </h3>

                        <p className="mt-2 text-center text-sm leading-6 text-[#746b61]">
                            This address will be permanently removed from your
                            account.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteId(
                                        null
                                    )
                                }
                                className="rounded-xl border border-[#d5cec2] px-4 py-3 text-sm font-semibold text-[#3e3730] transition hover:bg-[#eee8de]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-[#f8f4ec] transition hover:bg-red-700"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AddressPage;