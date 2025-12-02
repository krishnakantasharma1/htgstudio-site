// app/api/create-paypal-order/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
  const PAYPAL_MODE = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();

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

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Expecting { amount: number|string, currency: 'USD'|'INR'|... }
  const rawAmount = body?.amount;
  const currency = (body?.currency || "USD").toString().toUpperCase();

  if (rawAmount === undefined || rawAmount === null) {
    return NextResponse.json(
      { success: false, error: "Missing amount in request body" },
      { status: 400 }
    );
  }

  // Convert amount to Number and validate
  const amountNum = Number(rawAmount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid amount. Must be a positive number." },
      { status: 400 }
    );
  }

  // PayPal expects string with 2 decimal places
  const amountStr = amountNum.toFixed(2);

  try {
    // Step 1: Get access token
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
          error: "Failed to get PayPal access token",
          details: tokenData,
        },
        { status: 500 }
      );
    }

    // Step 2: Create order
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amountStr,
          },
        },
      ],
      application_context: {
        brand_name: "HTG Studio",
        user_action: "PAY_NOW",
      },
    };

    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("PayPal Create Order Error:", orderData);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create PayPal order",
          details: orderData,
        },
        { status: 500 }
      );
    }

    // Return order id (and helpful metadata)
    return NextResponse.json({
      success: true,
      id: orderData.id,
      amount: amountStr,
      currency,
      mode: PAYPAL_MODE,
    });
  } catch (error) {
    console.error("🔥 PayPal Create Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
