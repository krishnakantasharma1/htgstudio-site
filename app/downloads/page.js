"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DownloadsPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim();

    if (!trimmed) {
      setError("Please enter a download code.");
      return;
    }

    // redirect to /downloads/[code]
    router.push(`/downloads/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-6 sm:p-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Downloads
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Enter the <span className="font-semibold">download code</span>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Enter your code"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {error && (
            <p className="text-red-500 text-sm text-left">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-sm hover:shadow-md"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
