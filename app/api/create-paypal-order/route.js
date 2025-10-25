export async function POST(request) {
  try {
    const { amount, currency } = await request.json();

    // 🔐 Get PayPal access token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch(
      "https://https://api-m.paypal.com/v2/checkout/orders",
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

    // 💵 Create PayPal order
    const orderResponse = await fetch(
      "https://api-m.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
              },
            },
          ],
        }),
      }
    );

    const orderData = await orderResponse.json();

    return new Response(JSON.stringify(orderData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PayPal Create Order Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create PayPal order" }),
      { status: 500 }
    );
  }
}
