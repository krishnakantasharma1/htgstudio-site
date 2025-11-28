"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function PhoneBoostCourse() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef = useRef(null);

  // 📚 Define lessons (add URLs only)
  const lessons = [
    { id: "lesson1", title: "Lesson 1 — Welcome & Course Overview", url: "/lessons/lesson1.mp4" },
    { id: "lesson2", title: "Lesson 2 — Developer Tweaks", url: "/lessons/lesson2.mp4" },
    { id: "lesson3", title: "Lesson 3 — Battery Optimization", url: "/lessons/lesson3.mp4" },
    { id: "lesson4", title: "Lesson 4 — Deep Clean & Storage", url: "/lessons/lesson4.mp4" },
    { id: "lesson5", title: "Lesson 5 — Final Setup & Security", url: "/lessons/lesson5.mp4" },
  ];

  // 🔐 Require login + purchase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/account?next=/courses/phone-boost");
        return;
      }
      const key = `${user.email}_access`;
      const hasAccess = localStorage.getItem(key) === "true";
      if (!hasAccess) {
        router.replace("/course"); // redirect to promo page
        return;
      }
      setAllowed(true);
      setReady(true);
    });
    return () => unsub();
  }, [router]);

  // 🔒 Prevent right-click and shortcuts (disable downloads, inspect, record)
  useEffect(() => {
    const blockContext = (e) => e.preventDefault();
    const blockKeys = (e) => {
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "u" || e.key === "p")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J"))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // 🎥 Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !auth.currentUser) return;

    const saveProgress = async () => {
      const user = auth.currentUser;
      const watched = video.currentTime / 60;
      const duration = video.duration / 60;

      if (!duration || isNaN(watched)) return;

      const docRef = doc(db, "courseProgress", `${user.uid}_phone-boost`);
      const snap = await getDoc(docRef);
      const existingData = snap.exists() ? snap.data().videos || {} : {};

      existingData[lessons[activeVideo].id] = { watched, duration };

      await setDoc(
        docRef,
        {
          userId: user.uid,
          courseId: "phone-boost",
          videos: existingData,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    };

    const interval = setInterval(saveProgress, 10000); // every 10 sec
    video.addEventListener("pause", saveProgress);
    video.addEventListener("ended", saveProgress);

    return () => {
      clearInterval(interval);
      video.removeEventListener("pause", saveProgress);
      video.removeEventListener("ended", saveProgress);
    };
  }, [activeVideo]);

  // 🧭 If not ready or no access
  if (!ready || !allowed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Checking access…
      </div>
    );
  }

  // 🧠 Render main course layout
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-900 select-none">
      {/* Sidebar */}
      <aside className="lg:w-1/4 bg-gray-50 border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">📘 Course Playlist</h2>
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

      {/* Main Video Player */}
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
            ref={videoRef}
            src={lessons[activeVideo].url}
            controls
            autoPlay
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            className="w-full h-full object-cover rounded-2xl pointer-events-auto"
          />
        </div>

        {/* Navigation Buttons */}
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

