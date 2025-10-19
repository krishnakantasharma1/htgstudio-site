"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function CoursesPage() {
  const [hasAccess, setHasAccess] = useState(false);
    const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

        useEffect(() => {
            // Watch Firebase auth state
                const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                      setUser(currentUser);

                            if (currentUser) {
                                    const key = `${currentUser.email}_access`;
                                            const access = localStorage.getItem(key) === "true";
                                                    setHasAccess(access);
                            } else {
                                    setHasAccess(false);
                            }

                                  setLoading(false);
                });

                    return () => unsubscribe();
        }, []);

          const courses = [
              {
                    id: "phone-boost",
                          title: "Phone Performance Boost Masterclass",
                                description:
                                        "Make your phone faster, smoother, and extend battery life — the complete step-by-step course.",
                                              price: "₹149",
                                                    image: "/course-phone.jpg",
              },
          ];

            if (loading) {
                return (
                      <div className="flex items-center justify-center min-h-screen text-gray-500">
                              Loading your courses...
                                    </div>
                );
            }

              return (
                  <div className="bg-white min-h-screen py-20 px-6 text-gray-900">
                        <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                        className="text-4xl font-extrabold text-center mb-12"
                                                              >
                                                                      Our Courses
                                                                            </motion.h1>

                                                                                  <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                                                                          {courses.map((course, index) => (
                                                                                                    <motion.div
                                                                                                                key={course.id}
                                                                                                                            initial={{ opacity: 0, y: 20 }}
                                                                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                                                                                    transition={{ delay: index * 0.1 }}
                                                                                                                                                                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-gray-50"
                                                                                                                                                                          >
                                                                                                                                                                                      {/* Thumbnail */}
                                                                                                                                                                                                  <div className="h-56 w-full bg-gray-200 overflow-hidden">
                                                                                                                                                                                                                <img
                                                                                                                                                                                                                                src={course.image}
                                                                                                                                                                                                                                                alt={course.title}
                                                                                                                                                                                                                                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                                                                                                                                                                                                                                                              />
                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                      {/* Info */}
                                                                                                                                                                                                                                                                                                                  <div className="p-6 text-center">
                                                                                                                                                                                                                                                                                                                                <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                                                                                                                                                                                                                                                                                                                                                {course.title}
                                                                                                                                                                                                                                                                                                                                                              </h2>
                                                                                                                                                                                                                                                                                                                                                                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                                                                                                                                                                                                                                                                                                                                                                            {course.description}
                                                                                                                                                                                                                                                                                                                                                                                                          </p>
                                                                                                                                                                                                                                                                                                                                                                                                                        <p className="text-lg font-bold mb-6 text-blue-600">{course.price}</p>

                                                                                                                                                                                                                                                                                                                                                                                                                                      {/* Buttons */}
                                                                                                                                                                                                                                                                                                                                                                                                                                                    {!user ? (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      href="/account"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="inline-block px-8 py-3 bg-gray-800 text-white rounded-full font-medium text-base hover:bg-black transition"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          Login to Buy
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </Link>
                                                                                                                                                                                                                                                                                                                                                                                                                                                    ) : !hasAccess ? (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      href="/checkout/phone-boost"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium text-base hover:bg-blue-700 transition"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          Buy Now
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </Link>
                                                                                                                                                                                                                                                                                                                                                                                                                                                    ) : (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      href="/courses/phone-boost"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="inline-block px-8 py-3 bg-green-600 text-white rounded-full font-medium text-base hover:bg-green-700 transition"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          Access Course
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </Link>
                                                                                                                                                                                                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </motion.div>
                                                                                          ))}
                                                                                                </div>
                                                                                                    </div>
              );
}