// app/api/paypal-webhook/route.js
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";


// --------- FIREBASE ADMIN INITIALIZATION ---------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY)),
  });
}
const firestore = admin.firestore();
// -------------------------------------------------


export async function POST(req) {
  try {
    const bodyText = await req.text();
    const event = JSON.parse(bodyText);

    // ---- PayPal Headers ----
    const transmissionId = req.headers.get("paypal-transmission-id");
    const timestamp = req.headers.get("paypal-transmission-time");
    const signature = req.headers.get("paypal-transmission-sig");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");

    const PAYPAL_MODE = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
    const CLIENT = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const SECRET = process.env.PAYPAL_SECRET;

    const PAYPAL_API =
      PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // ---- Verify Webhook Signature ----
    const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${CLIENT}:${SECRET}`).toString("base64"),
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: signature,
        transmission_time: timestamp,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyData.verification_status !== "SUCCESS") {
      console.warn("❌ PayPal webhook verification failed");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    console.log("✅ PayPal Webhook Verified:", event.event_type);

    // ---- Handle Completed Payment ----
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const paymentId = event.resource.id;
      const purchaseUnits = event.resource.supplementary_data?.related_ids;
      const userId = event.resource.custom_id ?? null;

      if (!userId) {
        console.error("⚠️ Missing userId in PayPal custom_id");
        return NextResponse.json({ success: true });
      }

      await firestore.collection("purchases").doc(userId).set(
        {
          hasAccess: true,
          paymentId: paymentId,
          purchasedAt: new Date().toISOString(),
          verifiedBy: "PayPal Webhook",
        },
        { merge: true }
      );

      console.log("🔥 Access granted for:", userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Webhook Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
