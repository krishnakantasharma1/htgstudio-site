"use client";

import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // ✅ Automatically fetch user email
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email) setUserEmail(user.email);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!userEmail) {
      setError("You must be logged in to send a message.");
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        "service_ebyviio",  // Your EmailJS service ID
        "template_9ie0m47", // Your EmailJS template ID
        {
          from_name: formData.name || "HTG User",
          from_email: userEmail,
          message: formData.message,
        },
        "dvjcqWSaKscVIXlBS" // Your EmailJS public key
      );

      setSent(true);
      setFormData({ name: "", message: "" });
    } catch (err) {
      console.error("❌ EmailJS Error:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 sm:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md w-full max-w-lg text-center border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
          Contact Support
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Need help or have questions?  
          <br />
          Send us a message below.
          <span className="block text-blue-600 font-semibold mt-1">
            {userEmail || "Please log in"}
          </span>
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Message
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <div className="text-green-600 font-semibold text-lg mt-4">
            ✅ Message sent successfully!
            <p className="text-gray-600 text-sm mt-2">We’ll get back to you soon.</p>
          </div>
        )}

        {/* ✅ Telegram Button (No extra text) */}
        {/* ✅ Telegram Icon Button Only */}
<div className="mt-6 flex justify-center">
  <a
    href="https://t.me/htgstudio"  // 🔹 Replace with your actual link
    target="_blank"
    rel="noopener noreferrer"
  >
    <Image
      src="/tg.png"
      alt="Telegram"
      width={200}  // adjust size if needed
      height={50}
      className="cursor-pointer hover:opacity-80 transition"
    />
  </a>
</div>
      </div>
    </div>
  );
}