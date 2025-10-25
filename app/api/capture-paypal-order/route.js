export async function POST(request) {
  try {
    const { orderId } = await request.json();

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Failed to get PayPal access token" }),
        { status: 500 }
      );
    }

    // 🧾 Capture order
    const captureResponse = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureResponse.json();

    return new Response(JSON.stringify(captureData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PayPal Capture Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to capture PayPal order" }),
      { status: 500 }
    );
  }
}
