"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
      const [user, setUser] = useState<any>(null);
      const [menuOpen, setMenuOpen] = useState(false);
      const [hasAccess, setHasAccess] = useState(false);
      const menuRef = useRef<HTMLDivElement | null>(null);
      const [authChecked, setAuthChecked] = useState(false);

      useEffect(() => {
            const unsub = auth.onAuthStateChanged(() => {
                  setAuthChecked(true);
            });

            const handlePopState = () => window.location.reload();
            window.addEventListener("popstate", handlePopState);

            return () => {
                  unsub();
                  window.removeEventListener("popstate", handlePopState);
            };
      }, []);

      // ✅ Watch Firebase auth
      useEffect(() => {
            const checkAccess = (currentUser: any) => {
                  if (currentUser) {
                        const key = `${currentUser.email}_access`;
                        const access = localStorage.getItem(key) === "true";
                        setHasAccess(access);
                  } else {
                        setHasAccess(false);
                  }
            };

            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                  setUser(currentUser);
                  checkAccess(currentUser);
            });

            const handleAccessUpdate = () => {
                  if (auth.currentUser) checkAccess(auth.currentUser);
            };

            window.addEventListener("access-updated", handleAccessUpdate);
            window.addEventListener("storage", handleAccessUpdate);

            return () => {
                  unsubscribe();
                  window.removeEventListener("access-updated", handleAccessUpdate);
                  window.removeEventListener("storage", handleAccessUpdate);
            };
      }, []);

      // ✅ Close dropdown when clicking outside
      useEffect(() => {
            const handler = (e: MouseEvent) => {
                  if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                        setMenuOpen(false);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, []);

      // ✅ Logout handler
      const handleLogout = async () => {
            try {
                  await signOut(auth);
                  setUser(null);
                  setHasAccess(false);
                  setMenuOpen(false);

                  Object.keys(localStorage).forEach((key) => {
                        if (key.includes("_access")) localStorage.removeItem(key);
                  });

                  setTimeout(() => window.location.reload(), 300);
            } catch (err) {
                  console.error("Logout error:", err);
                  alert("Logout failed. Please try again.");
            }
      };

      // ✅ Handle back button reload
      useEffect(() => {
            const handlePopState = () => {
                  window.location.reload();
            };

            window.addEventListener("popstate", handlePopState);
            return () => window.removeEventListener("popstate", handlePopState);
      }, []);

      // ✅ Wait for Firebase auth to finish checking
      if (!authChecked) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        Checking session...
                  </div>
            );
      }

      


return (
      <html lang="en" className="light">

            <body
                  className={`${inter.className} bg-white text-gray-900 antialiased overflow-x-hidden`}
            >
                  {/* NAVBAR */}
                  <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between h-16">
                              {/* Logo */}
                              <Link href="/courses" className="flex items-center gap-2">
                                    <Image
                                          src="/logo.png"
                                          alt="HTG Studio Logo"
                                          width={36}
                                          height={36}
                                          className="rounded-md object-contain"
                                          priority
                                    />
                                    <span className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
                                          HTG Studio
                                    </span>
                              </Link>

                              {/* RIGHT MENU */}
                              <div className="flex items-center gap-5">
                                    {/* Desktop links */}
                                    <Link
                                          href="/courses"
                                          className="hidden sm:inline hover:text-blue-600 transition"
                                    >
                                          Our Courses
                                    </Link>

                                    <Link
                                          href="/about"
                                          className="hidden sm:inline hover:text-blue-600 transition"
                                    >
                                          About Us
                                    </Link>
                                    <Link
                                          href="/contact"
                                          className="hidden sm:inline hover:text-blue-600 transition"
                                    >
                                          Contact Us
                                    </Link>

                                    {hasAccess && (
                                          <>


                                                <Link
                                                      href="/dashboard"
                                                      className="hidden sm:inline hover:text-blue-600 transition"
                                                >
                                                      Dashboard
                                                </Link>
                                          </>
                                    )}

                                    {/* Account Icon / Dropdown */}
                                    <div className="relative" ref={menuRef}>
                                          {user ? (
                                                <>
                                                      <button
                                                            onClick={() => setMenuOpen(!menuOpen)}
                                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-lg transition"
                                                      >
                                                            {user.email?.[0]?.toUpperCase()}
                                                      </button>

                                                      {menuOpen && (
                                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 text-sm py-2 animate-fadeIn">
                                                                  <div className="px-4 py-2 border-b text-gray-600 truncate">
                                                                        {user.email}
                                                                  </div>

                                                                  {/* ✅ Mobile-only Links */}
                                                                  <div className="block sm:hidden">
                                                                        <Link
                                                                              href="/courses"
                                                                              onClick={() => setMenuOpen(false)}
                                                                              className="block px-4 py-2 hover:bg-gray-50 text-gray-800"
                                                                        >
                                                                              Our Courses
                                                                        </Link><Link
                                                                              href="/contact"
                                                                              onClick={() => setMenuOpen(false)}
                                                                              className="block px-4 py-2 hover:bg-gray-50 text-gray-800"
                                                                        >
                                                                              Contact
                                                                        </Link>

                                                                        <Link
                                                                              href="/about"
                                                                              onClick={() => setMenuOpen(false)}
                                                                              className="block px-4 py-2 hover:bg-gray-50 text-gray-800"
                                                                        >
                                                                              About Us
                                                                        </Link>

                                                                        {hasAccess && (
                                                                              <>


                                                                                    <Link
                                                                                          href="/dashboard"
                                                                                          onClick={() => setMenuOpen(false)}
                                                                                          className="block px-4 py-2 hover:bg-gray-50 text-gray-800"
                                                                                    >
                                                                                          Dashboard
                                                                                    </Link>
                                                                              </>
                                                                        )}
                                                                  </div>

                                                                  {/* Desktop Dashboard */}
                                                                  {hasAccess && (
                                                                        <Link
                                                                              href="/dashboard"
                                                                              onClick={() => setMenuOpen(false)}
                                                                              className="hidden sm:block px-4 py-2 hover:bg-gray-50 text-gray-800"
                                                                        >
                                                                              Dashboard
                                                                        </Link>
                                                                  )}

                                                                  <button
                                                                        onClick={handleLogout}
                                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                                                                  >
                                                                        Logout
                                                                  </button>
                                                            </div>
                                                      )}
                                                </>
                                          ) : (
                                                <Link
                                                      href="/account"
                                                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                                >
                                                      <Image
                                                            src="/account-icon.svg"
                                                            alt="Account"
                                                            width={20}
                                                            height={20}
                                                            className="object-contain"
                                                      />
                                                </Link>
                                          )}
                                    </div>
                              </div>
                        </div>
                  </nav>

                  {/* MAIN CONTENT */}
                  <main className="min-h-screen px-4 sm:px-6 md:px-8">{children}</main>

                  {/* FOOTER */}
                  <footer className="border-t border-gray-100 text-center py-8 text-gray-500 text-sm px-4">
                        © {new Date().getFullYear()} HTG Studio. All rights reserved.
                        <div className="mt-2 space-x-4">
                              <a href="/contact" className="hover:text-blue-600 transition">
                                    Contact us
                              </a>
                              <a href="/refund-policy" className="hover:text-blue-600 transition">
                                    Refund Policy
                              </a>
                              <a href="/privacy-policy" className="hover:text-blue-600 transition">
                                    Privacy Policy
                              </a>
                              <a href="/shipping-policy" className="hover:text-blue-600 transition">
                                    Shipping policy
                              </a>
                              <a href="/terms" className="hover:text-blue-600 transition">
                                    Terms & Conditions
                              </a>
                        </div>
                  </footer>
            </body>
      </html>
);}
