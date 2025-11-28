"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");
      setError("");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-semibold text-center mb-6">Log In</h2>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 py-2 rounded hover:bg-gray-100 transition mb-4"
        >
          <FcGoogle className="mr-2 text-lg" />
          Sign in with Google
        </button>

        <div className="text-center text-gray-400 mb-4">or</div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-full mb-3 p-2 rounded focus:outline-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full mb-4 p-2 rounded focus:outline-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {message && <p className="text-green-500 text-sm mt-3">{message}</p>}
      </div>
    </div>
  );
}
