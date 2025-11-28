import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.text();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const transmissionId = req.headers.get("paypal-transmission-id");
    const timestamp = req.headers.get("paypal-transmission-time");
    const signature = req.headers.get("paypal-transmission-sig");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");

    // ✅ Verify webhook signature (PayPal official method)
    const verifyRes = await fetch(
      `https://api-m.paypal.com/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: signature,
          transmission_time: timestamp,
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      }
    );

    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      console.warn("❌ Webhook verification failed:", verifyData);
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const userId = event.resource.custom_id || "unknown";
      const paymentId = event.resource.id;

      await setDoc(
        doc(db, "purchases", userId),
        {
          hasAccess: true,
          paymentId,
          purchasedAt: new Date().toISOString(),
          verifiedBy: "PayPal Webhook",
        },
        { merge: true }
      );

      console.log(`✅ Payment verified for ${userId} via PayPal webhook`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("⚠️ PayPal webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}