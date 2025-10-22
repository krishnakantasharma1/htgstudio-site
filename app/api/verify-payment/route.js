import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    return Response.json({ success: expected === razorpay_signature });
  } catch (err) {
    console.error("Verification error:", err.message);
    return Response.json({ success: false }, { status: 500 });
  }
}