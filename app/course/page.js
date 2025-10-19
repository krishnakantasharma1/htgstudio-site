"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase"; // safe to keep even if Firebase is disabled

export default function CoursePage() {
  const [user, setUser] = useState(null);

  // Track login status (safe even if Firebase off)
  useEffect(() => {
    if (auth?.onAuthStateChanged) {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe && unsubscribe();
    } else {
      setUser(null);
    }
  }, []);

  // Handle purchase flow
  const handleBuy = () => {
    const checkoutUrl = "/checkout/phone-boost";

    if (!user) {
      // If not logged in → go to account/login first
      window.location.href = `/account?next=${encodeURIComponent(checkoutUrl)}`;
    } else {
      // Already logged in → go directly to checkout
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen font-inter">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 border-b border-gray-100">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 text-gray-900"
        >
          Unlock Your Phone’s Hidden Power ⚡
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl text-lg text-gray-600 mb-12 leading-relaxed"
        >
          The Ultimate Performance Course — stop the lag, boost speed, and extend your battery life.
        </motion.p>

        {/* Promo Video Autoplay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-3xl aspect-video rounded-2xl shadow-lg mb-10 overflow-hidden"
        >
          <video
            src="/promo.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover rounded-2xl"
            poster="/video-thumbnail.jpg"
          />
        </motion.div>

        {/* Purchase Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBuy}
          className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg shadow hover:shadow-md transition-all duration-200"
        >
          Get Instant Access – ₹149 Lifetime
        </motion.button>

        <p className="text-gray-500 text-sm mt-4">
          30-Day Money-Back Guarantee 💸
        </p>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold mb-12 text-gray-900"
        >
          What You’ll Master
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            "🚀 Eliminate Lag – make your phone ultra-responsive.",
            "🔋 Double Battery Life – optimize background activity.",
            "🧹 Clean 10+ GB safely – free up space instantly.",
            "💻 Developer Tweaks – advanced secrets made simple.",
            "🔒 Security Boost – protect your privacy and data.",
            "🎯 Lifetime Access – one-time payment, forever updates.",
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <p className="text-gray-700 leading-relaxed text-lg">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gray-50 text-center border-t border-gray-100">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-6 text-gray-900"
        >
          A Note from HTG Studio
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto text-gray-600 leading-relaxed mb-8"
        >
          Hey, it’s <b>Hi Tech Gamerz</b> from the <b>HTG Studio</b> YouTube channel.  
          I’ve tested every trick, tweak, and setting on Android and iOS — and compiled the best ones here.  
          For the price of a coffee ☕, your phone can feel brand new again.
        </motion.p>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center border-t border-gray-100">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold mb-4 text-gray-900"
        >
          Lifetime Access for Less Than a Cup of Coffee
        </motion.h3>
        <p className="text-gray-500 mb-8 text-lg">
          Just ₹149 — one-time payment, lifetime updates.
        </p>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleBuy}
          className="px-10 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg shadow hover:shadow-lg transition-all duration-200"
        >
          Buy Now
        </motion.button>
      </section>
    </div>
  );
}
