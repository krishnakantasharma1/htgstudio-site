"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
    const [user, setUser] = useState(null);
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
                <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 md:px-8 bg-white text-gray-900 overflow-x-hidden">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left break-words">
                              Welcome{user ? `, ${user.email}` : ""}
                                    </h1>

                                          <p className="text-gray-600 mb-8 text-center sm:text-left">
                                                  Manage your courses below.
                                                        </p>

                                                              <div className="border rounded-xl p-6 bg-white shadow-sm transition-all hover:shadow-md">
                                                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-0">
                                                                                <div className="text-center sm:text-left">
                                                                                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                                                                                          Phone Boost Course
                                                                                                                      </h2>
                                                                                                                                  <p className="text-gray-500 text-sm">Lifetime access</p>
                                                                                                                                            </div>

                                                                                                                                                      {hasAccess ? (
                                                                                                                                                                  <Link
                                                                                                                                                                                href="/courses/phone-boost"
                                                                                                                                                                                              className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm sm:text-base hover:bg-blue-700 transition-all duration-200"
                                                                                                                                                                                                          >
                                                                                                                                                                                                                        Access Course
                                                                                                                                                                                                                                    </Link>
                                                                                                                                                      ) : (
                                                                                                                                                                  <Link
                                                                                                                                                                                href="/checkout/phone-boost"
                                                                                                                                                                                              className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm sm:text-base hover:bg-black transition-all duration-200"
                                                                                                                                                                                                          >
                                                                                                                                                                                                                        Buy Now
                                                                                                                                                                                                                                    </Link>
                                                                                                                                                      )}
                                                                                                                                                              </div>
                                                                                                                                                                    </div>
                                                                                                                                                                        </div>
            );
}