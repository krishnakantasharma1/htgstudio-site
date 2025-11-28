
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientDashboardLink() {
  const [hasAccess, setHasAccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const access = localStorage.getItem("hasAccess") === "true";
    setHasAccess(access);
  }, []);

  if (!hydrated) return null; // prevent hydration mismatch

  return (
    hasAccess && (
      <Link href="/dashboard" className="hidden md:inline hover:text-blue-600 transition">
        Dashboard
      </Link>
    )
  );
}