"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PhoneBoostCourse() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);

  const lessons = [
    { title: "Lesson 1 — Welcome & Course Overview", url: "/lessons/lesson1.mp4" },
    { title: "Lesson 2 — Developer Tweaks",          url: "/lessons/lesson2.mp4" },
    { title: "Lesson 3 — Battery Optimization",      url: "/lessons/lesson3.mp4" },
    { title: "Lesson 4 — Deep Clean & Storage",      url: "/lessons/lesson4.mp4" },
    { title: "Lesson 5 — Final Setup & Security",    url: "/lessons/lesson5.mp4" },
  ];

  // ✅ Guard: require login + purchase for this device
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/account?next=/courses/phone-boost");
        return;
      }
      const key = `${user.email}_access`;
      const has = localStorage.getItem(key) === "true";
      if (!has) {
        router.replace("/course"); // promo page (or /checkout/phone-boost if you prefer)
        return;
      }
      setAllowed(true);
      setReady(true);
    });
    return () => unsub();
  }, [router]);

  if (!ready || !allowed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Checking access…
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside className="lg:w-1/4 bg-gray-50 border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Playlist</h2>
        <ul className="space-y-3">
          {lessons.map((lesson, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.03 }}
              onClick={() => setActiveVideo(index)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                activeVideo === index
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {lesson.title}
            </motion.li>
          ))}
        </ul>

        <div className="mt-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Player */}
      <main className="flex-1 p-6 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-center"
        >
          {lessons[activeVideo].title}
        </motion.h1>

        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
          <video
            key={activeVideo}
            src={lessons[activeVideo].url}
            controls
            autoPlay
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <div className="mt-8 flex justify-between w-full max-w-4xl">
          <button
            disabled={activeVideo === 0}
            onClick={() => setActiveVideo((p) => p - 1)}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              activeVideo === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ← Previous
          </button>
          <button
            disabled={activeVideo === lessons.length - 1}
            onClick={() => setActiveVideo((p) => p + 1)}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              activeVideo === lessons.length - 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}