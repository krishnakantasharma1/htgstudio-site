import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = body;

    console.log("🧾 Verifying Payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing fields");
      return Response.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("❌ RAZORPAY_KEY_SECRET not found in environment");
      return Response.json(
        { success: false, message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // ✅ Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔐 Expected Signature:", expectedSignature);
    console.log("🔐 Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch");
      return Response.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // ✅ Signature matches — grant access
    await setDoc(
      doc(db, "purchases", userId),
      {
        hasAccess: true,
        paymentId: razorpay_payment_id,
        purchasedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("✅ Payment verified successfully");
    return Response.json({ success: true });
  } catch (err) {
    console.error("💥 Verification error:", err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
