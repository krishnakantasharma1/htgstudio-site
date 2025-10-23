import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
      // 🔹 Razorpay sends raw JSON — we must read it as text
          const body = await req.text();

              // 🔹 Signature header (sent by Razorpay)
                  const signature = req.headers.get("x-razorpay-signature");
                      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

                          // 🔹 Validate webhook signature
                              const expectedSignature = crypto
                                    .createHmac("sha256", secret)
                                          .update(body)
                                                .digest("hex");

                                                    if (expectedSignature !== signature) {
                                                          console.warn("❌ Invalid Razorpay Webhook signature!");
                                                                return new Response("Invalid signature", { status: 400 });
                                                    }

                                                        // 🔹 Parse webhook event JSON
                                                            const event = JSON.parse(body);

                                                                // 🔹 Handle successful payment capture event
                                                                    if (event.event === "payment.captured") {
                                                                          const payment = event.payload.payment.entity;

                                                                                const uid = payment.notes?.uid;
                                                                                      if (!uid) {
                                                                                              console.warn("⚠️ Missing UID in payment notes:", payment.id);
                                                                                                      return new Response("Missing UID in payment notes", { status: 400 });
                                                                                      }

                                                                                            console.log("✅ Verified Webhook for UID:", uid, "Payment ID:", payment.id);

                                                                                                  // 🔹 Minimal Firestore write (as per your rules)
                                                                                                        await setDoc(
                                                                                                                doc(db, "purchases", uid),
                                                                                                                        {
                                                                                                                                  hasAccess: true,
                                                                                                                                            paymentId: payment.id,
                                                                                                                                                      purchasedAt: new Date().toISOString(),
                                                                                                                        },
                                                                                                                                { merge: true }
                                                                                                        );

                                                                                                              console.log("🔥 Access granted via webhook:", uid);
                                                                    } else {
                                                                          console.log("ℹ️ Unhandled Razorpay event:", event.event);
                                                                    }

                                                                        return new Response("Webhook received", { status: 200 });
  } catch (err) {
      console.error("💥 Webhook error:", err);
          return new Response("Server error: " + err.message, { status: 500 });
  }
}
