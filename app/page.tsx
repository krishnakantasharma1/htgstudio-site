"use client";
import { useEffect } from "react";
export const metadata = {
  title: "HTG Studio – Boost Your Phone Performance Fast",
  description: "100% working phone optimization tricks, speed boosters, gaming tweaks, and performance guides—all in one place at HTG Studio.",
  keywords: [
    "phone boost",
    "clean phone lag fix",
    "android lag fix",
    "gaming boost",
    "bgmi boost",
    "phone performance",
    "htg studio course"
  ],
  openGraph: {
    title: "HTG Studio – Phone Boost & Performance Tips",
    description: "Learn real phone boosting methods that actually work.",
    url: "https://htgstudio.site",
    siteName: "HTG Studio",
    images: [
      {
        url: "/seo-banner.jpg",
        width: 1200,
        height: 630
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTG Studio",
    description: "Boost your phone performance with real methods.",
    images: "/seo-banner.jpg",
  },
};

export default function Home() {
  useEffect(() => {
    window.location.href = "/courses";
  }, []);
  return null;
  
  
}
<section class="mt-10 text-center text-gray-600 text-sm max-w-2xl mx-auto px-4">  HTG Studio provides real Android performance boosting tips, lag-fix methods,   gaming optimization guides, and safe tweaks used by experts.   Our course helps you unlock your phone’s full potential without fake apps or risky APKs.</section>
