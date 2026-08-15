import Razorpay from "razorpay";

const hasRazorpayKeys =
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET);

const razorpay = hasRazorpayKeys
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : {
        orders: {
            create: async () => {
                throw new Error(
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
                );
            },
        },
    };

export default razorpay;
