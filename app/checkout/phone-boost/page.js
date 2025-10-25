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
  const [showTelegramHint, setShowTelegramHint] = useState(false);
  const router = useRouter();

  // ✅ Detect country via IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setCountry(data.country_name || "Unknown");
        setCountryCode(data.country_code || "");
        if (data.country_code && data.country_code !== "IN") {
          setCurrency("USD");
        }
      })
      .catch(() => setCountry("Unknown"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Restricted countries (PayPal limited)
  const restrictedCountries = ["PK", "BD", "NG", "AF", "CU", "IR", "SD", "SY"];

  // ✅ Watch user auth
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
        console.error("Error reading Firestore:", err);
      }
    });
    return () => unsub();
  }, [router]);

  // ✅ Razorpay for India
  const handleRazorpay = async () => {
    if (!user) return alert("Please log in to continue checkout.");
    if (!accepted)
      return alert("Please accept the Terms & Refund Policy before proceeding.");

    setProcessing(true);
    setShowTelegramHint(false);

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 175,
        currency: "INR",
        userId: user.uid,
      }),
    });

    const data = await res.json();
    if (!data.success || !data.order) {
      alert("Failed to create order. Please try again.");
      setProcessing(false);
      return;
    }

    const order = data.order;
    const rzp = new window.Razorpay({
      key: "rzp_live_RW88YpfthOTT67",
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
          if (!verifyData.success)
            return alert("Payment verification failed. Please contact support.");

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
          alert("Payment successful! Redirecting...");
          router.push("/dashboard");
          setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
          console.error(err);
          alert("Payment succeeded but verification failed. Contact support.");
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => setShowTelegramHint(true),
      },
      prefill: { email: user.email || "" },
      theme: { color: "#2563eb" },
    });
    rzp.open();
  };

  // ✅ PayPal Smart Buttons (Popup)
  useEffect(() => {
    if (currency === "INR" || !user) return; // Skip if India
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => {
      if (window.paypal && document.getElementById("paypal-button-container")) {
        window.paypal.Buttons({
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
            const capture = await fetch("/api/capture-paypal-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID,
                userId: user.uid,
              }),
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
              alert("Payment successful! Redirecting to dashboard...");
              router.push("/dashboard");
              setTimeout(() => window.location.reload(), 1000);
            } else {
              alert("Payment capture failed. Please contact support.");
            }
            setProcessing(false);
          },
          onError: (err) => {
            console.error(err);
            alert("PayPal payment failed. Please try again.");
            setProcessing(false);
          },
        }).render("#paypal-button-container");
      }
    };
    document.body.appendChild(script);
  }, [currency, user, router]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        Detecting your location...
      </div>
    );

  if (hasAccess)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-8 text-center">
          <Image
            src="/course-phone.jpg"
            alt="Phone Boost Course"
            width={600}
            height={300}
            className="rounded-xl mb-5 object-cover mx-auto"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You already own this course 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            You can access your content anytime from your dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-sm hover:shadow-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-6 sm:p-8 text-center relative">
        <Image
          src="/course-phone.jpg"
          alt="Phone Boost Course"
          width={600}
          height={300}
          className="rounded-xl mb-5 object-cover mx-auto"
        />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Phone Boost Masterclass
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Make your phone faster, smoother, and extend its battery life.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-700 border">
          <p>
            🌍 You’re accessing from{" "}
            <span className="font-semibold">{country}</span>
          </p>
          <p>
            💳 Price:{" "}
            <span className="font-semibold text-blue-600">
              {currency === "INR" ? "₹175" : "$1.99"}
            </span>{" "}
            (one-time payment)
          </p>
        </div>

        <div className="flex items-center mb-4 text-left">
          <input
            id="terms"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 select-none">
            I accept the{" "}
            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/refund-policy" target="_blank" className="text-blue-600 hover:underline">
              Refund Policy
            </a>.
          </label>
        </div>

        {/* Pay Buttons */}
        {currency === "INR" ? (
          <button
            onClick={handleRazorpay}
            disabled={processing}
            className={`w-full py-3 rounded-lg text-white font-semibold transition shadow-sm hover:shadow-md ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {processing ? "Processing..." : "Pay ₹175 via Razorpay"}
          </button>
        ) : (
          <>
            <div id="paypal-button-container" className="w-full mt-3"></div>
            {restrictedCountries.includes(countryCode) && (
              <p className="text-sm text-gray-800 mt-5 font-semibold bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                ⚠️ Can’t make payment using Razorpay or PayPal?{" "}
                <a
                  href="https://t.me/htgstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline"
                >
                  Contact us on Telegram
                </a>{" "}
                to pay via Binance, Payoneer, or your preferred method.
              </p>
            )}
          </>
        )}

        {showTelegramHint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-bounce">
            💬 Can’t complete your payment using the available methods? Contact us on Telegram @htgstudio
          </div>
        )}
      </div>
    </div>
  );
}