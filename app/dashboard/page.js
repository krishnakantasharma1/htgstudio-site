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
                <div className="max-w-3xl mx-auto py-10 px-4">
                      <h1 className="text-3xl font-bold mb-4">Welcome{user ? `, ${user.email}` : ""}</h1>
                            <p className="text-gray-600 mb-8">Manage your courses below.</p>

                                  <div className="border rounded-xl p-6 bg-white shadow-sm">
                                          <div className="flex items-center justify-between">
                                                    <div>
                                                                <h2 className="text-xl font-semibold">Phone Boost Course</h2>
                                                                            <p className="text-gray-500 text-sm">Lifetime access</p>
                                                                                      </div>
                                                                                                {hasAccess ? (
                                                                                                            <Link
                                                                                                                          href="/courses/phone-boost"
                                                                                                                                        className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                                                                                                                                    >
                                                                                                                                                                  Access Course
                                                                                                                                                                              </Link>
                                                                                                ) : (
                                                                                                            <Link
                                                                                                                          href="/checkout/phone-boost"
                                                                                                                                        className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black"
                                                                                                                                                    >
                                                                                                                                                                  Buy Now
                                                                                                                                                                              </Link>
                                                                                                )}
                                                                                                        </div>
                                                                                                              </div>
                                                                                                                  </div>
            );
}