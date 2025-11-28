import { NextResponse } from "next/server";

export async function POST() {
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
  const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

  // ✅ Select correct PayPal environment
  const PAYPAL_API_BASE =
    PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    console.error("❌ Missing PayPal credentials in environment variables");
    return NextResponse.json(
      { success: false, error: "Missing PayPal credentials" },
      { status: 500 }
    );
  }

  try {
    // ✅ Step 1: Get access token
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
        { success: false, error: "Failed to get PayPal access token", details: tokenData },
        { status: 500 }
      );
    }

    // ✅ Step 2: Create an order
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "0.01",
            },
          },
        ],
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("PayPal Create Order Error:", orderData);
      return NextResponse.json(
        { success: false, error: "Failed to create PayPal order", details: orderData },
        { status: 500 }
      );
    }

    // ✅ Step 3: Return order ID to frontend
    return NextResponse.json({ success: true, id: orderData.id });
  } catch (error) {
    console.error("🔥 PayPal Create Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}