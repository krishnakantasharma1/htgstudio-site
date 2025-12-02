// app/api/capture-paypal-order/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = body?.orderId || body?.orderID || body?.order_id;
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    const PAYPAL_MODE = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId in request body" },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("❌ Missing PayPal credentials in environment variables");
      return NextResponse.json(
        { success: false, error: "Missing PayPal credentials" },
        { status: 500 }
      );
    }

    const PAYPAL_API_BASE =
      PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Step 1: Obtain access token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
      "base64"
    );
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("PayPal Token Error:", tokenData);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to obtain PayPal access token",
          details: tokenData,
        },
        { status: 500 }
      );
    }

    // Step 2: Capture order
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const captureData = await captureRes.json();
    if (!captureRes.ok) {
      console.error("PayPal Capture Error:", captureData);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to capture PayPal order",
          details: captureData,
        },
        { status: 500 }
      );
    }

    // Optionally: you can read captureData.purchase_units[0].payments.captures[0] for amount/id
    // Return capture details so frontend/backend can persist to Firestore
    return NextResponse.json({
      success: true,
      id: captureData.id || orderId,
      status: captureData.status,
      capture: captureData,
    });
  } catch (err) {
    console.error("🔥 Capture PayPal Order Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
