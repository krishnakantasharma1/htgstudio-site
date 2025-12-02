"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromoVideo from "@/app/components/PromoVideo"; // ensure this exists


/**
 * DOWNLOADS: add new download codes here. Files should live under public/files/.
 */
const DOWNLOADS = {
  "1001": {
    title: "BGMI Lag Fix Config v1",
    description: "Optimized config file for smoother gameplay on mid-range devices.",
    fileUrl: "/files/config-1001.zip",
  },
  "1002": {
    title: "Ultra Graphics Config",
    description: "High-quality graphics config for powerful devices.",
    fileUrl: "/files/config-1002.zip",
  },
  // add more entries as needed
};


export default function DownloadCodePage({ params }) {
  const router = useRouter();
  const { code } = params || { code: "" };
  const [info, setInfo] = useState(null);
  const [entered, setEntered] = useState("");


  useEffect(() => {
    if (!code) {
      setInfo(null);
      return;
    }
    const found = DOWNLOADS[String(code)];
    setInfo(found || null);
  }, [code]);


  // navigate to course page (change path here if your course path differs)
  const gotoCourse = () => {
    router.push("/courses/phone-boost");
  };


  const tryCode = () => {
    if (!entered) return;
    router.push(`/downloads/${encodeURIComponent(entered.trim())}`);
  };


  // ---------- INVALID / NOT FOUND UI ----------
  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-lg p-6 text-center">
          {/* Course promo at top (small) to promote course even when code invalid */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Phone Performance Boost Masterclass:-</h2>
          <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl text-base sm:text-lg text-gray-600 mb-8 leading-relaxed"
        >
          Advanced tweaks that nobody reveals -
        </motion.p>
          <div
            role="button"
            onClick={gotoCourse}
            className="cursor-pointer mb-4 w-full max-w-md mx-auto"
            aria-label="Play promo and go to course"
          >
            <PromoVideo videoId="Ua0VVb0iyOs" />
            <div className="mt-3 text-sm text-blue-600 font-semibold hover:underline">Watch promo & go to course →</div>
          </div>


          <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid or expired code</h1>


          <p className="text-gray-600 mb-6 text-sm">
            The code <span className="font-mono font-semibold">{code || "(none)"}</span> doesn’t match any active download.
          </p>


          <div className="space-y-3">
            <input
              value={entered}
              onChange={(e) => setEntered(e.target.value)}
              placeholder="Enter download code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />


            <div className="flex gap-3">
              <button
                onClick={tryCode}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Try code
              </button>
              <button
                onClick={() => router.push("https://htgstudio.com/courses")}
                className="flex-1 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
              >
                Home
              </button>
            </div>
          </div>


          <p className="text-gray-500 text-xs mt-6">
            If you think this is a mistake, contact support on{" "}
            <a href="https://t.me/htgstudio" className="text-blue-600 font-semibold" target="_blank" rel="noreferrer">
              Telegram (@htgstudio)
            </a>.
          </p>
        </div>
      </div>
    );
  }


  // ---------- INFO FOUND → DOWNLOAD UI ----------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-2xl p-6 sm:p-8 text-center">
        {/* Course header + promo */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Phone Performance Boost Masterclass:-</h2>
          <div
            role="button"
            onClick={gotoCourse}
            className="cursor-pointer mx-auto mb-4 w-full max-w-3xl"
            aria-label="Watch promo and go to course"
          >
            <PromoVideo videoId="Ua0VVb0iyOs" />
          </div>
          <button
            onClick={gotoCourse}
            className="mb-4 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            View Course 
          </button>
          ____________________________________________________________________________________
        </div>



        {/* Download info */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{info.title}</h1>
        <p className="text-gray-700 mb-4 text-sm">{info.description}</p>


        <div className="space-y-3 max-w-md mx-auto">
          <a
            href={info.fileUrl}
            download
            className="block w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition shadow-sm hover:shadow-md"
          >
            ⬇️ Download File
          </a>


          <button
            onClick={() => router.push("Video link")}
            className="w-full py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
          >
            How to Download?
          </button>
        </div>


        <div className="mt-6 text-left text-sm text-gray-500 max-w-2xl mx-auto">
          <p>
            <strong>Note:</strong> Downloads are served directly from our site. If the file
            doesn’t begin, check your browser’s download settings or contact support on{" "}
            <a href="https://t.me/htgstudio" className="text-blue-600 font-semibold" target="_blank" rel="noreferrer">
              Telegram (@htgstudio)
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}