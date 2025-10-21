"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function CoursePage() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState(0);

  // ✅ Track login status
  useEffect(() => {
    if (auth?.onAuthStateChanged) {
      const unsub = auth.onAuthStateChanged((u) => setUser(u));
      return () => unsub && unsub();
    }
  }, []);

  // ✅ Animated student counter
  useEffect(() => {
    const target = 12487;
    const start = Math.floor(target * 0.4);
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setStudents(Math.floor(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // ✅ Handle purchase
  const handleBuy = () => {
    const checkout = "/checkout/phone-boost";
    if (!user)
      window.location.href = `/account?next=${encodeURIComponent(checkout)}`;
    else window.location.href = checkout;
  };

  // ✅ Testimonials
  const testimonials = [
    {
      name: "Maria Santos",
      quote: " Bro this actually works. My phone feels faster!",
      date: "2 days ago",
    },
    {
      name: "Ahmad Rafi",
      quote:
        " I never knew this video could do this. Totally worth.",
      date: "4 days ago",
    },
    {
      name: "Lucas Andrade",
      quote:
        "Even without the root tweaks it feels smoother",
      date: "1 week ago",
    },
  ];

  return (
    <div className="bg-white text-gray-900 min-h-screen font-inter">
      {/* 🎯 HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center py-14 px-4 sm:px-6 border-b border-gray-100">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
        >
          Unlock Your Phone’s Hidden Power ⚡
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl text-base sm:text-lg text-gray-600 mb-8 leading-relaxed"
        >
          Advanced tweaks that nobody reveals — for both{" "}
          <b>non-rooted</b> and <b>rooted</b> users. Learn to root safely,
          optimize deeply, and make your phone ultra-responsive. ✅ No hype. Just
          results.
        </motion.p>

        {/* ✅ Popular count */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
            🔥 Popular
          </span>
          <span>Trusted by</span>
          <span className="text-xl font-bold tabular-nums">
            {students.toLocaleString()}
          </span>
          <span>Users</span>
        </div>

        {/* 🎥 Promo Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-3xl aspect-video rounded-2xl shadow-lg mb-8 overflow-hidden"
        >
          <video
            src="/promo.mp4"
            autoPlay
            muted
            loop
            playsInline
            poster="/video-thumbnail.jpg"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBuy}
          className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg shadow hover:shadow-md transition-all duration-200"
        >
          💥 Get Instant Access – $2 Lifetime
        </motion.button>
        <p className="text-gray-500 text-sm mt-3">
          💸 7-Day Money-Back Guarantee
        </p>
      </section>

      {/* 📚 WHAT YOU’LL MASTER */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold mb-12"
        >
          What You’ll Master
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            "🚀 Eliminate Lag – make your phone ultra-responsive.",
            "💻 Developer Tweaks – advanced secrets made simple.",
            "🎯 Lifetime Access – one-time payment, forever updates.",
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-gray-700 leading-relaxed text-lg">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
          What Early Students Say 💬
        </h2>
        <div className="space-y-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </div>
                  <div className="text-gray-400 text-xs">{t.date}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t.quote}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📦 WHAT’S INSIDE */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto bg-gray-50 text-center border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">
          What’s Inside the Course 📦
        </h2>
        <ul className="max-w-3xl mx-auto text-gray-700 text-base sm:text-lg space-y-2 text-left sm:text-center">
          <li>✔️ Non-Root & Root methods explained clearly</li>
          <li>✔️ Real device demos — no theory, only action</li>
          <li>✔️ Rooting guide + safety steps (educational)</li>
          <li>✔️ Bonus: Debloat, thermals, sustained speed</li>
        </ul>
      </section>

      {/* 💡 WHY CHOOSE HTG */}
<section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto text-center border-t border-gray-100">
  <h2 className="text-2xl sm:text-3xl font-bold mb-8">
    Why Choose HTG Studio 💡
  </h2>

  {/* Logos Row */}
  <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 flex-wrap">
    {/* HTG */}
    <a
      href="https://m.youtube.com/channel/UCq2O8k9SGhr3jF27rwIV4cQ"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center min-w-[90px] hover:opacity-90 transition"
    >
      <img
        src="/logo.png"
        alt="Hi Tech Gamerz Logo"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-contain mb-1"
      />
      <p className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
        Hi Tech Gamerz
      </p>
      <p className="text-gray-500 text-[10px] sm:text-xs">38.6K Subs</p>
    </a>

    {/* “×” separator */}
    <span className="text-gray-400 font-semibold text-xl sm:text-2xl mx-1">
      ×
    </span>

    {/* Scriptotweaks */}
    <a
      href="https://m.youtube.com/channel/UC155RIDBmbrUqR0WwHlBx4A"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center min-w-[90px] hover:opacity-90 transition"
    >
      <img
        src="/logo2.png"
        alt="Scriptotweaks Logo"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-contain mb-1"
      />
      <p className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
        Scriptotweaks
      </p>
      <p className="text-gray-500 text-[10px] sm:text-xs">30.7K Subs</p>
    </a>
  </div>

  {/* Collaboration Description */}
  <p className="max-w-3xl mx-auto text-gray-700 text-sm sm:text-base leading-relaxed">
    We, the creators behind <b>Hi-Tech Gamerz</b> and <b>Scriptotweaks</b>, have
    helped thousands of users improve their phone’s performance through our
    YouTube channels. With years of Android tweaking experience, this course
    combines all our secrets to make your phone faster, smoother, and smarter.
  </p>

  {/* Bullet Points */}
  <ul className="text-gray-700 text-sm sm:text-base space-y-2 mt-6 max-w-2xl mx-auto text-left sm:text-center">
    <li>⚙️ Real Android tweaks tested by experts</li>
    <li>📱 Works for both rooted and non-rooted users</li>
    <li>💬 Trusted by 10k+</li>
    <li>🎯 Straightforward lessons — no filler</li>
  </ul>
</section>

{/* 💰 LIMITED TIME OFFER */}
<section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-gray-100 bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-sm mt-10">
  
  <motion.h2
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900"
  >
    🎉 Limited-Time Launch Offer
  </motion.h2>

  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    viewport={{ once: true }}
    className="text-gray-600 mb-8 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
  >
    Unlock the complete <b>Phone Boost Masterclass</b> today at a special
    launch price! Learn advanced tweaks, root safely, and speed up any
    Android — <span className="text-blue-600 font-semibold">lifetime access included</span>.
  </motion.p>

  {/* Price Box */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 }}
    viewport={{ once: true }}
    className="inline-block bg-white border border-blue-100 rounded-2xl shadow-md px-8 py-6 mb-6"
  >
    <div className="text-gray-500 text-sm mb-1">Original Price</div>
    <div className="text-2xl sm:text-3xl font-semibold text-gray-400 line-through">$5</div>
    <div className="text-gray-700 mt-2 text-sm sm:text-base">Now only</div>
    <div className="text-4xl sm:text-5xl font-bold text-blue-600">$2</div>
    <p className="text-gray-500 text-sm mt-2">🎯 One-time payment • Lifetime access</p>
  </motion.div>

  {/* CTA Button */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.96 }}
    onClick={handleBuy}
    className="px-10 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg shadow hover:shadow-lg transition-all duration-200"
  >
    💥 Get the Course for Just $2
  </motion.button>

  <p className="text-gray-500 text-xs mt-3">
    ⏳ Offer valid for a limited time only. Don’t miss out!
  </p>

  
</section>
<br/>
<motion.h5
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="text-2xl sm:text-3xl font-semibold mb-4 leading-snug"
>
  Ready to Unlock True Performance? ⚙️
</motion.h5>
      
    </div>
  );
}