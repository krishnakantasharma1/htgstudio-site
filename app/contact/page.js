"use client";

import { useState } from "react";
import emailjs from "emailjs-com";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",  // 🔹 Replace this
        "YOUR_TEMPLATE_ID", // 🔹 Replace this
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        "YOUR_PUBLIC_KEY"   // 🔹 Replace this
      );

      setSent(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("EmailJS Error:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 sm:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md w-full max-w-lg text-center border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Contact Us</h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Have questions or need support? Fill out the form below or email us at  
          <span className="block text-blue-600 font-semibold mt-1">
            htgstudios110@gmail.com
          </span>
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Your Name</label>
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
              <label className="block text-gray-700 font-medium mb-1">Your Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
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
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
      </div>
    </div>
  );
}