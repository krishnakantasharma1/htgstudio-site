import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

    const PAYPAL_API_BASE =
      PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    // ✅ Step 1: Get Access Token again
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
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
        { success: false, error: "Failed to obtain PayPal token", details: tokenData },
        { status: 500 }
      );
    }

    // ✅ Step 2: Capture the order
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
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
        { success: false, error: "Capture failed", details: captureData },
        { status: 500 }
      );
    }

    // ✅ Step 3: Return capture info to frontend
    return NextResponse.json({
      success: true,
      id: captureData.id,
      status: captureData.status,
    });
  } catch (err) {
    console.error("🔥 Capture PayPal Order Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}