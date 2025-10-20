"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

// Ensure Firebase keeps the login session persistent
if (auth && typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Persistence setup failed:", err);
  });
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Observe auth
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) {
      try {
        const ref = doc(db, "purchases", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data()?.hasAccess) {
          localStorage.setItem(`${u.email}_access`, "true");
          window.dispatchEvent(new Event("access-updated"));
        }
      } catch (err) {
        console.warn("Access sync failed:", err);
      }
    }
  });
  return () => unsub();
}, []);

  const getNextUrl = () => {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  };

  const syncPurchaseFromFirestore = async () => {
    try {
      const u = auth.currentUser;
      if (!u) return;
      const ref = doc(db, "purchases", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data()?.hasAccess) {
        localStorage.setItem("hasAccess", "true");
      } else {
        // keep false unless set by checkout
        if (localStorage.getItem("hasAccess") === null) {
          localStorage.setItem("hasAccess", "false");
        }
      }
    } catch (e) {
      // If rules block for now, don't break login
      if (localStorage.getItem("hasAccess") === null) {
        localStorage.setItem("hasAccess", "false");
      }
      console.warn("Could not read purchases (will rely on localStorage):", e);
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
    setLoading(true);
      setError("");

        try {
            // ✅ Sign in and persist session
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const loggedUser = userCredential.user;

                        // Wait a moment for rehydration (important!)
                            await new Promise((resolve) => setTimeout(resolve, 600));

                                // ✅ Fetch course access
                                    const ref = doc(db, "purchases", loggedUser.uid);
                                        const snap = await getDoc(ref);

                                            if (snap.exists() && snap.data()?.hasAccess) {
                                                  localStorage.setItem(`${loggedUser.email}_access`, "true");
                                                        window.dispatchEvent(new Event("access-updated"));
                                            } else {
                                                  localStorage.setItem(`${loggedUser.email}_access`, "false");
                                            }

                                                // ✅ Redirect after stable auth
                                                    router.push("/dashboard");
                                                        setTimeout(() => window.location.reload(), 800);
        } catch (err) {
            console.error("Firebase login error:", err.code, err.message);
                if (err.code === "auth/invalid-credential") {
                      setError("Invalid email or password. Please try again.");
                } else {
                      setError("Login failed! Please try again later.");
                }
        } finally {
            setLoading(false);
        }
};


  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (typeof window !== "undefined") {
        localStorage.setItem("hasAccess", "false");
      }
      router.push(getNextUrl());
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      if (typeof window !== "undefined") {
        await syncPurchaseFromFirestore();
      }
      router.push(getNextUrl());
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setError("Google Sign-In failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
      await signOut(auth);
          setUser(null);

              // Remove all user-specific keys
                  Object.keys(localStorage).forEach((key) => {
                        if (key.includes("_access")) localStorage.removeItem(key);
                  });

                      setTimeout(() => window.location.reload(), 400);
  } catch (err) {
      console.error("Logout error:", err);
  }
};

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-md text-center border border-gray-100">
        {!user ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-3xl">
                👤
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegistering ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-500 mb-6">
              {isRegistering
                ? "Join HTG Studio to unlock your courses."
                : "Login to your account to continue."}
            </p>

            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-2 rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Please wait..." : isRegistering ? "Register" : "Login"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-3 text-gray-400 text-sm">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 rounded-lg py-2 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>

            <p className="text-gray-600 mt-6 text-sm">
              {isRegistering ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 font-medium hover:underline"
              >
                {isRegistering ? "Login" : "Register"}
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-3xl">
                👤
              </div>
              <h2 className="text-xl font-semibold mt-2">{user.email}</h2>
              <p className="text-gray-500 text-sm mb-6">
                Logged in to HTG Studio
              </p>

              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
