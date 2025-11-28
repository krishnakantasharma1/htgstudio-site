import Razorpay from "razorpay";

export async function POST(req) {
  try {
      const { amount, currency, userId } = await req.json();

          console.log("📦 Incoming body:", { amount, currency, userId });
              console.log("🔑 Keys:", {
                    key_id: process.env.RAZORPAY_KEY_ID ? "✅ Found" : "❌ Missing",
                          key_secret: process.env.RAZORPAY_KEY_SECRET ? "✅ Found" : "❌ Missing",
              });

                  if (!amount || !currency || !userId) {
                        return Response.json(
                                { success: false, error: "Missing data", body: { amount, currency, userId } },
                                        { status: 400 }
                        );
                  }

                      const instance = new Razorpay({
                            key_id: process.env.RAZORPAY_KEY_ID,
                                  key_secret: process.env.RAZORPAY_KEY_SECRET,
                      });

                          const order = await instance.orders.create({
                                amount: Math.round(amount * 100),
                                      currency,
                                            receipt: "order_" + Math.random().toString(36).slice(2),
                                                  notes: { uid: userId },
                                                        payment_capture: 1,
                          });

                              console.log("✅ Order created:", order.id);
                                  return Response.json({ success: true, order });
  } catch (error) {
      console.error("💥 Order creation error:", error);
          return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
