import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, currency } = await req.json();

    if (!amount || !currency) {
      return Response.json({ success: false, error: "Missing data" }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: "order_" + Math.random().toString(36).slice(2),
      payment_capture: 1,
    });

    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
