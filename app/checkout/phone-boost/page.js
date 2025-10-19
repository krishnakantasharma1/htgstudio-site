"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function CheckoutPage() {
  const router = useRouter();

    const [user, setUser] = useState(null);
      const [checkingUser, setCheckingUser] = useState(true);
        const [processing, setProcessing] = useState(false);
          const [hasAccess, setHasAccess] = useState(false);

            // ✅ Watch for Firebase login state
              useEffect(() => {
                  const unsubscribe = auth.onAuthStateChanged(async (u) => {
                        setUser(u);
                              setCheckingUser(false);

                                    if (u) {
                                            try {
                                                      const ref = doc(db, "purchases", u.uid);
                                                                const snap = await getDoc(ref);
                                                                          if (snap.exists() && snap.data()?.hasAccess) {
                                                                                      setHasAccess(true);
                                                                                                  localStorage.setItem(`${u.email}_access`, "true");
                                                                          }
                                            } catch (err) {
                                                      console.error("Error reading purchase:", err);
                                            }
                                    }
                  });

                      return () => unsubscribe();
              }, []);

                // ✅ Load Razorpay script dynamically
                  useEffect(() => {
                      const script = document.createElement("script");
                          script.src = "https://checkout.razorpay.com/v1/checkout.js";
                              script.async = true;
                                  document.body.appendChild(script);
                                      return () => {
                                            document.body.removeChild(script);
                                      };
                  }, []);

                    // ✅ Handle Razorpay payment
                      const handlePayment = async () => {
                          if (checkingUser) return;
                              if (!user) {
                                    router.push("/account?next=/checkout/phone-boost");
                                          return;
                              }

                                  setProcessing(true);

                                      const options = {
                                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                                                  amount: 200 * 100,
                                                        currency: "INR",
                                                              name: "HTG Studio",
                                                                    description: "Phone Boost Course - Lifetime Access",
                                                                          image: "/logo.png",

                                                                                handler: async function (response) {
                                                                                        try {
                                                                                                  console.log("✅ Payment success:", response);

                                                                                                            const activeUser = auth.currentUser;
                                                                                                                      if (!activeUser) {
                                                                                                                                  alert("Payment succeeded, but no user detected. Please contact support.");
                                                                                                                                              return;
                                                                                                                      }

                                                                                                                                // ✅ Save purchase locally
                                                                                                                                          localStorage.setItem(`${activeUser.email}_access`, "true");

                                                                                                                                                    // ✅ Notify navbar immediately
                                                                                                                                                              window.dispatchEvent(new Event("access-updated"));

                                                                                                                                                                        // ✅ Save purchase in Firestore
                                                                                                                                                                                  const purchaseRef = doc(db, "purchases", activeUser.uid);
                                                                                                                                                                                            await setDoc(
                                                                                                                                                                                                        purchaseRef,
                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                  hasAccess: true,
                                                                                                                                                                                                                                                paymentId: response.razorpay_payment_id,
                                                                                                                                                                                                                                                              purchasedAt: new Date().toISOString(),
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                { merge: true }
                                                                                                                                                                                            );

                                                                                                                                                                                                      console.log("✅ Firestore write successful");

                                                                                                                                                                                                                alert("Payment successful! Redirecting to your dashboard...");

                                                                                                                                                                                                                          // ✅ Go to dashboard and refresh so navbar updates instantly
                                                                                                                                                                                                                                    router.push("/dashboard");
                                                                                                                                                                                                                                              setTimeout(() => window.location.reload(), 1000);
                                                                                        } catch (err) {
                                                                                                  console.error("❌ Error writing to Firestore:", err);
                                                                                                            alert("Payment succeeded, but data sync failed. Please contact support.");
                                                                                        } finally {
                                                                                                  setProcessing(false);
                                                                                        }
                                                                                },

                                                                                      prefill: {
                                                                                              name: user.displayName || "HTG User",
                                                                                                      email: user.email,
                                                                                      },
                                                                                            theme: { color: "#2563EB" },
                                      };

                                          const paymentObject = new window.Razorpay(options);

                                              paymentObject.on("payment.failed", function (response) {
                                                    console.error("❌ Payment failed:", response);
                                                          alert("Payment failed. Please try again.");
                                                                setProcessing(false);
                                              });

                                                  paymentObject.open();
                      };

                        // ✅ If user already owns course
                          if (hasAccess) {
                              return (
                                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                                            <h1 className="text-3xl font-bold mb-4">You already own this course 🎉</h1>
                                                    <p className="text-gray-600 mb-6">Access it anytime from your dashboard.</p>
                                                            <button
                                                                      onClick={() => router.push("/dashboard")}
                                                                                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                                                                                        >
                                                                                                  Go to Dashboard
                                                                                                          </button>
                                                                                                                </div>
                              );
                          }

                            // ✅ While checking auth
                              if (checkingUser) {
                                  return (
                                        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                                                <h1 className="text-2xl font-semibold text-gray-700 mb-2">Checking account…</h1>
                                                        <p className="text-gray-500 text-sm">Please wait a moment</p>
                                                              </div>
                                  );
                              }

                                // ✅ Main checkout view
                                  return (
                                      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white text-gray-900 px-4">
                                            <h1 className="text-4xl font-bold mb-4">Unlock Phone Boost Course ⚡</h1>
                                                  <p className="text-gray-600 max-w-xl text-center mb-8">
                                                          Get lifetime access for just <b>₹200</b> — boost speed, extend battery life, and
                                                                  secure your phone like a pro.
                                                                        </p>

                                                                              <button
                                                                                      onClick={handlePayment}
                                                                                              disabled={processing}
                                                                                                      className={`px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200 shadow ${
                                                                                                                processing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                                                                                      }`}
                                                                                                            >
                                                                                                                    {processing ? "Processing..." : "Buy Now"}
                                                                                                                          </button>

                                                                                                                                <p className="text-gray-400 text-sm mt-6">
                                                                                                                                        Secure checkout powered by Razorpay 🔒
                                                                                                                                              </p>
                                                                                                                                                  </div>
                                  );
}