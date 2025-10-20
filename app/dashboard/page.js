"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null); // ✅ added user state
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        window.location.href = "/account?next=/dashboard";
        return;
      }

      setUser(u);
      const key = `${u.email}_access`;
      setHasAccess(localStorage.getItem(key) === "true");
      setReady(true);
    });

    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 md:px-8 bg-white text-gray-900">
      {/* HEADER */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center sm:text-left break-words">
        Welcome{user ? `, ${user.email}` : ""}
      </h2>
      <p className="text-gray-600 mb-8 text-center sm:text-left">
        Manage your enrolled courses below.
      </p>

      {/* COURSE CARD */}
      <div className="border rounded-2xl bg-white shadow-md overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-1/3 h-44 sm:h-auto">
            <Image
              src="/course-phone.jpg"
              alt="Phone Boost Course"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Course Info */}
          <div className="flex flex-col justify-between p-6 sm:w-2/3 text-center sm:text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                Phone Boost Masterclass
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Boost your phone’s speed, battery life, and performance.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Lifetime Access
              </p>
            </div>

            <div className="mt-6 sm:mt-4">
              {hasAccess ? (
                <Link
                  href="/courses/phone-boost"
                  className="inline-block px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm sm:text-base font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Access Course
                </Link>
              ) : (
                <Link
                  href="/checkout/phone-boost"
                  className="inline-block px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm sm:text-base font-medium hover:bg-black transition-all duration-200"
                >
                  Buy Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-gray-500 text-xs mt-8">
        © {new Date().getFullYear()} HTG Studio. All rights reserved.
      </p>
    </div>
  );
}