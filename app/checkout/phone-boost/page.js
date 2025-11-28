"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";

export default function CheckoutPage() {
  const [user, setUser] = useState(null);
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [showHover, setShowHover] = useState(false);
  const router = useRouter();

  // ✅ Detect user country
    // ✅ Detect user country
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const detectedCountry = data.country_name || "Unknown";
        const detectedCode = data.country_code || "";

        setCountry(detectedCountry);
        setCountryCode(detectedCode);

        // ✅ Always use USD if:
        // - user is outside India
        // - OR detection failed ("Unknown")
        // - OR using VPN (country code missing)
        // - OR accessing from restricted country (like PK)
        if (
          detectedCode !== "IN" ||
          detectedCountry === "Unknown" ||
          !detectedCode ||
          ["PK", "BD", "NG", "AF", "CU", "IR", "SD", "SY"].includes(detectedCode)
        ) {
          setCurrency("USD");
        } else {
          setCurrency("INR");
        }
      })
      .catch(() => {
        // ✅ If detection completely fails, default to USD (PayPal)
        setCountry("Unknown");
        setCurrency("USD");
      })
      .finally(() => setLoading(false));
  }, []);


  const restrictedCountries = ["PK", "BD", "NG", "AF", "CU", "IR", "SD", "SY"];

  // ✅ Watch Firebase Auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/account?next=/checkout/phone-boost");
        return;
      }
      setUser(u);
      try {
        const ref = doc(db, "purchases", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data()?.hasAccess) {
          setHasAccess(true);
          localStorage.setItem(`${u.email}_access`, "true");
        }
      } catch (err) {
        console.error("Firestore error:", err);
      }
    });
    return () => unsub();
  }, [router]);

  // ✅ Razorpay Payment
  const handleRazorpay = async () => {
    if (!accepted) {
      setInfoMessage("⚠️ Please accept the Terms & Refund Policy before making a payment.");
      setTimeout(() => setInfoMessage(""), 4000);
      return;
    }
    if (!user) return alert("Please log in first.");

    setProcessing(true);
    setShowHover(false);

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 175, currency: "INR", userId: user.uid }),
    });

    const data = await res.json();
    if (!data.success) {
      setProcessing(false);
      setShowHover(true);
      return;
    }

    const order = data.order;
    const rzp = new window.Razorpay({
      key: "rzp_live_RXzo16nV2Hdrdj",
      amount: order.amount,
      currency: order.currency,
      name: "HTG Studio",
      description: "Phone Boost Course",
      image: "/logo.png",
      order_id: order.id,
      handler: async (response) => {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.uid,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            setShowHover(true);
            setProcessing(false);
            return;
          }
          await setDoc(
            doc(db, "purchases", user.uid),
            {
              hasAccess: true,
              paymentId: response.razorpay_payment_id,
              purchasedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          localStorage.setItem(`${user.email}_access`, "true");
          alert("✅ Payment successful! Redirecting...");
          router.push("/dashboard");
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          setShowHover(true);
        } finally {
          setProcessing(false);
        }
      },
      modal: {
  ondismiss: () => {
    setProcessing(false); // 🧩 Reset so user can retry
    setShowHover(true);
  },
},

      prefill: { email: user.email },
      theme: { color: "#2563eb" },
    });
    rzp.open();
  };

  // ✅ PayPal Integration
// ✅ PayPal Integration (bulletproof terms enforcement)
useEffect(() => {
  if (currency === "INR" || !user) return;
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const container = document.getElementById("paypal-button-container");
  if (!container) return;
  container.innerHTML = "";

  const renderButtons = () => {
    if (window.paypal && window.paypal.Buttons) {
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "blue", shape: "rect", label: "paypal" },

          // 🛑 Stop PayPal popup if Terms not accepted
          onClick: (data, actions) => {
            if (!accepted) {
              // Persist message state safely outside PayPal DOM
              setInfoMessage("⚠️ Please accept the Terms & Refund Policy before making a payment.");
              setShowHover(false);

              // Keep message visible for 5s minimum, not instant removal
              clearTimeout(window.__termsTimer);
              window.__termsTimer = setTimeout(() => {
                setInfoMessage("");
              }, 50000);

              return actions.reject(); // stop popup completely
            }
            return actions.resolve(); // allow popup
          },

          createOrder: async () => {
            const res = await fetch("/api/create-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: "1.99", currency: "USD" }),
            });
            const data = await res.json();
            return data.id;
          },

          onApprove: async (data) => {
            setProcessing(true);
            setShowHover(false);

            const capture = await fetch("/api/capture-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, userId: user.uid }),
            });
            const result = await capture.json();

            if (result.success) {
              await setDoc(
                doc(db, "purchases", user.uid),
                {
                  hasAccess: true,
                  paymentId: result.id,
                  purchasedAt: new Date().toISOString(),
                },
                { merge: true }
              );
              localStorage.setItem(`${user.email}_access`, "true");
              alert("✅ Payment successful! Redirecting...");
              router.push("/dashboard");
              setTimeout(() => window.location.reload(), 1000);
            } else {
              setShowHover(true);
            }

            setProcessing(false);
          },

          onError: () => {
            setShowHover(true);
            setInfoMessage("⚠️ Payment failed. Please try again or contact @htgstudio.");
            clearTimeout(window.__termsTimer);
            window.__termsTimer = setTimeout(() => {
              setInfoMessage("");
            }, 6000);
          },
        })
        .render("#paypal-button-container");
    }
  };

  // ✅ Load PayPal SDK dynamically
  if (!window.paypal) {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = renderButtons;
    document.body.appendChild(script);
  } else {
    renderButtons();
  }
}, [currency, user,accepted, router]);

  // ✅ Auto-hide hover after 10s
  useEffect(() => {
    if (showHover) {
      const timer = setTimeout(() => setShowHover(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showHover]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        Detecting your location...
      </div>
    );

  if (hasAccess)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <Image src="/course-phone.jpg" alt="Course" width={600} height={300} className="rounded-xl mb-5 object-cover mx-auto" />
          <h1 className="text-3xl font-bold mb-2">You already own this course 🎉</h1>
          <p className="text-gray-600 mb-6">Access your content anytime from your dashboard.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-6 sm:p-8 text-center relative">
        <Image src="/course-phone.jpg" alt="Phone Boost Course" width={600} height={300} className="rounded-xl mb-5 object-cover mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Boost Masterclass</h1>
        <p className="text-gray-600 mb-6 text-sm">Make your phone faster, smoother, and extend its battery life.</p>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-700 border">
          <p>🌍 You’re accessing from <span className="font-semibold">{country}</span></p>
          <p>💳 Price: <span className="font-semibold text-blue-600">{currency === "INR" ? "₹175" : "$1.99"}</span> (one-time payment)</p>
        </div>

        <div className="flex items-center mb-4 text-left">
          <input
            id="terms"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I accept the{" "}
            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a> and{" "}
            <span className="text-blue-600 hover:underline cursor-default">Refund</span>{' '}
<a href="/refund-policy" target="_blank" className="text-blue-600 hover:underline">
  Policy
</a>
          </label>
        </div>

        {currency === "INR" ? (
          <button
            onClick={handleRazorpay}
            disabled={processing}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            {processing ? "Processing..." : "Pay ₹175 via Razorpay"}
          </button>
        ) : (
          <>
            <div id="paypal-button-container" className="w-full mt-3"></div>
            {/* ✅ Constant text under PayPal */}
            
          </>
        )}

        {infoMessage && (
          <p className="text-sm text-gray-800 mt-4 font-semibold bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 transition">
            {infoMessage}
          </p>
        )}

        {/* ⚠️ Show contact message for all PayPal (non-Indian) users */}
{/* ⚠️ Show contact message for all PayPal (non-Indian) users */}
{currency === "USD" && (
  <p className="text-sm text-gray-800 mt-5 font-semibold bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
    💬 Can’t make payment using the available methods?{" "}
    <a
      href="https://t.me/htgstudio"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 font-bold hover:underline"
    >
      Contact us on Telegram
    </a>{" "}
    to pay via <span className="font-semibold">Binance, Payoneer, or your preferred method.</span>
  </p>
)}



        {/* 💬 Hover for failed payments (auto-hides after 10s) */}
        {showHover && (
          <div className="mt-4 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-pulse">
    💬 Can’t make payment using the available methods? Contact {" "}
    <a
      href="https://t.me/htgstudio"
      target="_blank"
      rel="noopener noreferrer"
      className="underline font-semibold"
    >
      @htgstudio
    </a>
  </div>
        )}
      </div>
    </div>
  );
}