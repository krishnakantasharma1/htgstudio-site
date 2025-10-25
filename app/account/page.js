"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ✅ Keep session persistent
if (auth && typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((err) =>
    console.warn("Persistence setup failed:", err)
  );
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Detect previous page
  const [previousUrl, setPreviousUrl] = useState(null);
  useEffect(() => {
    if (typeof document !== "undefined" && document.referrer) {
      const referrer = document.referrer;
      // only set if it's from the same domain
      if (referrer.includes(window.location.origin)) {
        setPreviousUrl(referrer);
      }
    }
  }, []);

  // ✅ Observe auth
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

          // ✅ Redirect logged-in user to previous page (if available)
          if (previousUrl) {
            window.location.href = previousUrl;
          } else {
            router.back(); // fallback
          }
        } catch (err) {
          console.warn("Access sync failed:", err);
        }
      }
    });
    return () => unsub();
  }, [previousUrl, router]);

  // ✅ Next URL redirect
  const getNextUrl = () => {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  };

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;

      const ref = doc(db, "purchases", loggedUser.uid);
      const snap = await getDoc(ref);
      localStorage.setItem(
        `${loggedUser.email}_access`,
        snap.exists() && snap.data()?.hasAccess ? "true" : "false"
      );
      window.dispatchEvent(new Event("access-updated"));

      // ✅ Go back to previous page instead of dashboard
      if (previousUrl) {
        window.location.href = previousUrl;
      } else {
        router.back();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register → auto-login → go back
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      localStorage.setItem(`${newUser.email}_access`, "false");
      window.dispatchEvent(new Event("access-updated"));

      // ✅ Go back after signup
      if (previousUrl) {
        window.location.href = previousUrl;
      } else {
        router.back();
      }
    } catch (err) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else {
        setError("Failed to register. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      const ref = doc(db, "purchases", u.uid);
      const snap = await getDoc(ref);
      localStorage.setItem(`${u.email}_access`, snap.exists() ? "true" : "false");
      window.dispatchEvent(new Event("access-updated"));

      // ✅ Go back after Google sign-in
      if (previousUrl) {
        window.location.href = previousUrl;
      } else {
        router.back();
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setError("Google Sign-In failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("_access")) localStorage.removeItem(key);
      });
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ UI (unchanged)
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
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter password"
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-2 rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                  ? "Register"
                  : "Login"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-3 text-gray-400 text-sm">or</span>
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
                {isRegistering ? "Register with Google" : "Continue with Google"}
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
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-3xl">
              👤
            </div>
            <h2 className="text-xl font-semibold mt-2">{user.email}</h2>
            <p className="text-gray-500 text-sm mb-6">Logged in to HTG Studio</p>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}