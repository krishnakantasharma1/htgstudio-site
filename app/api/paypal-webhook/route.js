// app/api/paypal-webhook/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * PayPal webhook route
 * - safe JSON parsing
 * - verify signature with PayPal
 * - writes purchases/{userId} when payment/capture is completed
 */

export async function POST(req) {
  try {
    // Read raw body as text (safe)
    const bodyText = await req.text();

    // If body is empty, return 400 instead of crashing build
    if (!bodyText) {
      console.warn("PayPal webhook: empty body");
      return NextResponse.json({ success: false, error: "Empty body" }, { status: 400 });
    }

    // Try parse JSON safely
    let event;
    try {
      event = JSON.parse(bodyText);
    } catch (err) {
      console.warn("PayPal webhook: invalid JSON", err);
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Required PayPal headers for verification
    const transmissionId = req.headers.get("paypal-transmission-id");
    const timestamp = req.headers.get("paypal-transmission-time");
    const signature = req.headers.get("paypal-transmission-sig");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");
    const webhookId = process.env.PAYPAL_WEBHOOK_ID; // must be set in env

    if (!transmissionId || !timestamp || !signature || !certUrl || !authAlgo || !webhookId) {
      console.warn("PayPal webhook: missing headers or WEBHOOK_ID");
      return NextResponse.json(
        { success: false, error: "Missing webhook headers or PAYPAL_WEBHOOK_ID" },
        { status: 400 }
      );
    }

    // Choose PayPal API base (sandbox vs live)
    const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
    const PAYPAL_API_BASE =
      PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("PayPal webhook: missing client id / secret in env");
      return NextResponse.json({ success: false, error: "PayPal credentials missing" }, { status: 500 });
    }

    // Verify webhook signature with PayPal
    const verifyRes = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // PayPal requires Basic auth (client:secret) here
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: signature,
        transmission_time: timestamp,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || verifyData.verification_status !== "SUCCESS") {
      console.warn("PayPal webhook: verification failed", verifyData);
      return NextResponse.json({ success: false, error: "Webhook verification failed", details: verifyData }, { status: 400 });
    }

    // Verified -> process event
    const eventType = event.event_type || (event.event && event.event.type);
    // handle common payment success events
    if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "PAYMENT.CAPTURE.DENIED") {
      const resource = event.resource || event;
      const paymentId = resource.id || resource.payment_id || "unknown";
      // custom_id is often where you pass your userId during order creation — adapt as needed
      const customId = resource.custom_id || resource.invoice_id || resource.supplementary_data?.related_ids?.order_id || "unknown";
      const userId = customId || "unknown";

      if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
        // mark purchase in Firestore (backend trusted)
        try {
          await setDoc(doc(db, "purchases", userId), {
            hasAccess: true,
            paymentId,
            purchasedAt: new Date().toISOString(),
            verifiedBy: "PayPal Webhook",
            raw: resource,
          }, { merge: true });

          console.log(`PayPal webhook: purchase recorded for ${userId} (payment ${paymentId})`);
        } catch (err) {
          console.error("PayPal webhook: Firestore write failed", err);
          // return success to PayPal (delivery succeeded) but log error
          return NextResponse.json({ success: true, warning: "Firestore write failed" });
        }
      } else {
        console.log(`PayPal webhook: capture denied for ${userId}`, resource);
      }
    } else if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "CHECKOUT.ORDER.COMPLETED") {
      // optional: handle checkout order events
      // If you rely on capture, PayPal will also send capture events; handle as above.
      console.log("PayPal webhook: received checkout order event", eventType);
    } else {
      // Unhandled event types — safe to acknowledge
      console.log("PayPal webhook: unhandled event type", eventType);
    }

    // respond 200
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PayPal webhook: unexpected error", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
