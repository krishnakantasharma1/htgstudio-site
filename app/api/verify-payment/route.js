import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
      const body = await req.json();
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

              const secret = process.env.RAZORPAY_KEY_SECRET;

                  const expectedSignature = crypto
                        .createHmac("sha256", secret)
                              .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                                    .digest("hex");

                                        if (expectedSignature !== razorpay_signature) {
                                              console.log("❌ Signature mismatch");
                                                    return Response.json({ success: false, message: "Invalid signature" }, { status: 400 });
                                        }

                                            // ✅ Payment verified - give access
                                                await setDoc(doc(db, "purchases", userId), {
                                                      hasAccess: true,
                                                            paymentId: razorpay_payment_id,
                                                                  purchasedAt: new Date().toISOString(),
                                                });

                                                    console.log("✅ Payment verified and access granted:", userId);

                                                        return Response.json({ success: true });
  } catch (err) {
      console.error("Verification error:", err.message);
          return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
