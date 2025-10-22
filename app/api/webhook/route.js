import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    // Extract email or custom notes if you passed them while creating order
    const email = payment.email || "unknown";
    const uid = payment.notes?.uid || "unknown";

    await setDoc(doc(db, "purchases", uid), {
      hasAccess: true,
      paymentId: payment.id,
      email,
      amount: payment.amount / 100,
      currency: payment.currency,
      timestamp: new Date(),
    });
  }

  return new Response("Webhook received", { status: 200 });
}
