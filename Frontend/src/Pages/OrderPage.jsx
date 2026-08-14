import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useThrottle from "../hooks/useThrottle";


const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // PRODUCT FROM PRODUCT DETAIL PAGE
  // =========================================================

  const product = location.state?.product || null;

  const initialQuantity = Number(
    location.state?.quantity || 1
  );

  const [quantity, setQuantity] = useState(
    initialQuantity
  );

  // =========================================================
  // ADDRESS
  // =========================================================

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [addressLoading, setAddressLoading] =
    useState(true);

  const [addressError, setAddressError] =
    useState("");

  // =========================================================
  // ORDER
  // =========================================================

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [paymentMode, setPaymentMode] = useState("upi");

  // =========================================================
  // FETCH ALL ADDRESSES
  // =========================================================

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      setAddressError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setAddressError(
          "Please login to continue."
        );

        setAddressLoading(false);

        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/addressesDetail/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      /*
       * Depending on your ApiResponse,
       * addresses may be:
       *
       * res.data.data
       * res.data.data.addresses
       * res.data.data.items
       */

      const data =
        res.data?.data;

      let addressList = [];

      if (Array.isArray(data)) {
        addressList = data;
      } else if (
        Array.isArray(data?.addresses)
      ) {
        addressList = data.addresses;
      } else if (
        Array.isArray(data?.items)
      ) {
        addressList = data.items;
      }

      setAddresses(addressList);

      // Find default address
      const defaultAddress =
        addressList.find(
          (address) =>
            address.isDefault === true
        );

      if (defaultAddress) {
        setSelectedAddress(
          defaultAddress
        );
      } else if (
        addressList.length > 0
      ) {
        setSelectedAddress(
          addressList[0]
        );
      } else {
        setSelectedAddress(null);
      }

    } catch (error) {
      console.error(
        "Failed to fetch addresses:",
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
        error?.response?.status === 401
      ) {
        setAddressError(
          "Your login session has expired. Please login again."
        );
      } else if (
        error?.response?.status === 404
      ) {
        setAddressError(
          "Address service could not be found."
        );
      } else {
        setAddressError(
          error?.response?.data?.message ||
          "Failed to load addresses."
        );
      }

      setAddresses([]);
      setSelectedAddress(null);

    } finally {
      setAddressLoading(false);
    }
  };

  // =========================================================
  // LOAD ADDRESSES
  // =========================================================

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =========================================================
  // QUANTITY
  // =========================================================

  const increaseQuantity = () => {
    if (!product) return;

    const maxQuantity = Number(
      product.quantity || 1
    );

    setQuantity((current) =>
      Math.min(
        current + 1,
        maxQuantity
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  };

  // =========================================================
  // PRICE
  // =========================================================

  const subtotal = useMemo(() => {
    if (!product) return 0;

    return (
      Number(product.price || 0) *
      quantity
    );
  }, [product, quantity]);

  const deliveryCharge = useMemo(() => {
    if (subtotal >= 1000) {
      return 0;
    }

    return 50;
  }, [subtotal]);

  const totalAmount =
    subtotal + deliveryCharge;

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder = async () => {
    if (!product) {
      alert("Product information is missing.");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (!paymentMode) {
      alert("Please select a payment method.");
      return;
    }

    try {
      setPlacingOrder(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to place your order.");
        navigate("/login");
        return;
      }

      const orderData = {
        productId: product._id,
        quantity,
        addressId: selectedAddress._id,

        paymentMethod: "online",

        // IMPORTANT:
        // "upi" or "card", NOT "ONLINE"
        onlineMode: paymentMode,
      };


      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const order = res.data?.data?.order;

      if (!order) {
        throw new Error(
          "Order was created but order data was not returned."
        );
      }

      // Move to payment page
      navigate("/payment", {
        state: {
          order,
          paymentMode,
        },
      });

    } catch (error) {
      console.error("Place order error:", error);

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
        "Failed to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const throttledPayment = useThrottle(
    handlePlaceOrder,
    1500
);

  // =========================================================
  // NO PRODUCT
  // =========================================================

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
            🛒
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            No product selected
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Please select a product before
            continuing to checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
                    HEADER
                ================================================= */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-4 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
          >
            ← Back
          </button>

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
                Checkout
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Complete Your Order
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Review your order and delivery
                details before placing it.
              </p>
            </div>

            <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 sm:block">
              🔒 Secure Checkout
            </div>

          </div>

        </div>

        {/* =================================================
                    MAIN GRID
                ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* =================================================
                        LEFT
                    ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                            PRODUCT
                        ================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Your Product
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Order Summary
                  </h2>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600">
                  {product.category}
                </span>

              </div>

              <div className="mt-5 flex gap-4 rounded-2xl bg-slate-50 p-4">

                {/* PRODUCT IMAGE */}

                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">

                  {product.images?.length >
                    0 ? (
                    <img
                      src={
                        product
                          .images[0]
                      }
                      alt={
                        product.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : product.imageUrl ? (
                    <img
                      src={
                        product.imageUrl
                      }
                      alt={
                        product.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">
                      📦
                    </div>
                  )}

                </div>

                {/* PRODUCT DETAILS */}

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    ₹
                    {Number(
                      product.price ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    per item
                  </p>

                  {/* QUANTITY */}

                  <div className="mt-4 flex items-center justify-between">

                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">

                      <button
                        type="button"
                        onClick={
                          decreaseQuantity
                        }
                        disabled={
                          quantity <=
                          1
                        }
                        className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="flex h-9 w-10 items-center justify-center border-x border-slate-200 text-xs font-bold text-slate-800">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={
                          increaseQuantity
                        }
                        disabled={
                          quantity >=
                          Number(
                            product.quantity ||
                            1
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                      >
                        +
                      </button>

                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                            ADDRESS
                        ================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-lg">
                      📍
                    </span>

                    <h2 className="text-base font-bold text-slate-900">
                      Delivery Address
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Select where you want
                    your order delivered.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/addresses"
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Manage
                </button>

              </div>

              {/* ADDRESS LOADING */}

              {addressLoading && (
                <div className="mt-5 animate-pulse rounded-2xl bg-slate-50 p-5">

                  <div className="h-4 w-32 rounded bg-slate-200" />

                  <div className="mt-3 h-3 w-full rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />

                </div>
              )}

              {/* ADDRESS ERROR */}

              {!addressLoading &&
                addressError && (
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">

                    <p className="text-sm font-bold text-red-700">
                      Unable to load
                      addresses
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-500">
                      {
                        addressError
                      }
                    </p>

                    <button
                      type="button"
                      onClick={
                        fetchAddresses
                      }
                      className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Try Again
                    </button>

                  </div>
                )}

              {/* ADDRESS LIST */}

              {!addressLoading &&
                !addressError &&
                addresses.length >
                0 && (
                  <div className="mt-5 space-y-3">

                    {addresses.map(
                      (
                        address
                      ) => {
                        const isSelected =
                          selectedAddress?._id ===
                          address._id;

                        return (
                          <button
                            key={
                              address._id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedAddress(
                                address
                              )
                            }
                            className={`w-full rounded-2xl border p-4 text-left transition ${isSelected
                              ? "border-amber-400 bg-amber-50/60 ring-4 ring-amber-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <span className="text-sm font-bold text-slate-900">
                                    {
                                      address.name
                                    }
                                  </span>

                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-500">
                                    {
                                      address.type ||
                                      "Home"
                                    }
                                  </span>

                                  {address.isDefault && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                                      Default
                                    </span>
                                  )}

                                </div>

                                <p className="mt-2 text-xs leading-6 text-slate-500">

                                  {
                                    address.addressLine1
                                  }

                                  {address.addressLine2 &&
                                    `, ${address.addressLine2}`}

                                  {address.landmark &&
                                    `, ${address.landmark}`}

                                  {address.city &&
                                    `, ${address.city}`}

                                  {address.state &&
                                    `, ${address.state}`}

                                  {address.pincode &&
                                    ` - ${address.pincode}`}

                                </p>

                                <p className="mt-2 text-xs font-medium text-slate-600">
                                  📞{" "}
                                  {
                                    address.phone
                                  }
                                </p>

                              </div>

                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected
                                  ? "border-amber-500 bg-amber-500 text-white"
                                  : "border-slate-300"
                                  }`}
                              >
                                {isSelected &&
                                  "✓"}
                              </div>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              {/* NO ADDRESS */}

              {!addressLoading &&
                !addressError &&
                addresses.length ===
                0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      📍
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                      No delivery
                      address
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Add a delivery
                      address before
                      placing your
                      order.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/addressDetail"
                        )
                      }
                      className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      + Add Address
                    </button>

                  </div>
                )}

            </section>


            {/* ================================
                        PAYMENT METHOD
                ================================ */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Method
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Choose how you want to pay
                </p>
              </div>

              {/* UPI / CARD SELECTION */}
              <div className="mt-5 grid grid-cols-2 gap-3">

                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("upi")}
                  className={`rounded-xl border p-4 text-left transition ${paymentMode === "upi"
                      ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="text-lg">
                    📱
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    UPI
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Google Pay, PhonePe, Paytm, etc.
                  </p>

                  {paymentMode === "upi" && (
                    <div className="mt-3 text-[10px] font-bold text-emerald-600">
                      ✓ Selected
                    </div>
                  )}
                </button>

                {/* CARD */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("card")}
                  className={`rounded-xl border p-4 text-left transition ${paymentMode === "card"
                      ? "border-slate-900 bg-slate-50 ring-2 ring-slate-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="text-lg">
                    💳
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    Card
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Credit / Debit Card
                  </p>

                  {paymentMode === "card" && (
                    <div className="mt-3 text-[10px] font-bold text-emerald-600">
                      ✓ Selected
                    </div>
                  )}
                </button>

              </div>

            </section>

          </div>

          {/* =================================================
                        RIGHT - ORDER SUMMARY
                    ================================================= */}

          <div>

            <div className="sticky top-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="text-base font-bold text-slate-900">
                  Order Summary
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                  {quantity} item
                  {quantity !== 1
                    ? "s"
                    : ""}
                </span>

              </div>

              {/* PRICE DETAILS */}

              <div className="mt-6 space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-slate-400">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-700">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-slate-400">
                    Delivery
                  </span>

                  {deliveryCharge ===
                    0 ? (
                    <span className="font-bold text-emerald-600">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-700">
                      ₹
                      {deliveryCharge}
                    </span>
                  )}

                </div>

              </div>

              {/* FREE DELIVERY MESSAGE */}

              {subtotal <
                1000 && (
                  <div className="mt-5 rounded-xl bg-amber-50 px-3 py-2.5 text-[10px] font-medium leading-5 text-amber-700">
                    Add ₹
                    {(
                      1000 -
                      subtotal
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    more to get
                    free delivery.
                  </div>
                )}

              {/* TOTAL */}

              <div className="mt-6 border-t border-slate-100 pt-5">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-xs text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      ₹
                      {totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  <span className="text-[10px] text-slate-400">
                    Inclusive
                    of taxes
                  </span>

                </div>

              </div>

              {/* SELECTED ADDRESS */}

              {selectedAddress && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Delivering To
                  </p>

                  <p className="mt-2 text-xs font-bold text-slate-800">
                    {
                      selectedAddress.name
                    }
                  </p>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-slate-400">
                    {
                      selectedAddress.addressLine1
                    }
                    ,{" "}
                    {
                      selectedAddress.city
                    }
                    ,{" "}
                    {
                      selectedAddress.state
                    }{" "}
                    -{" "}
                    {
                      selectedAddress.pincode
                    }
                  </p>

                </div>
              )}

              {/* PLACE ORDER */}

              <button
                type="button"
                onClick={
                  throttledPayment
                }
                disabled={
                  placingOrder ||
                  !selectedAddress
                }
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >

                {placingOrder ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />

                    Processing...
                  </>
                ) : (
                  <>
                    <span>
                      🔒
                    </span>

                    Place Order
                  </>
                )}

              </button>

              {!selectedAddress && (
                <p className="mt-3 text-center text-[10px] font-medium text-red-400">
                  Please select a delivery
                  address.
                </p>
              )}

              {/* TRUST */}

              <div className="mt-5 flex justify-center gap-3 text-[9px] font-medium text-slate-400">

                <span>
                  ✓ Secure
                </span>

                <span>
                  •
                </span>

                <span>
                  ✓ Easy Returns
                </span>

                <span>
                  •
                </span>

                <span>
                  ✓ Fast Delivery
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Order;