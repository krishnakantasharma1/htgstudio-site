"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AccessSyncer() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        // ✅ Wait a tiny delay to ensure auth.user is fully loaded
        await new Promise((r) => setTimeout(r, 500));

        const ref = doc(db, "purchases", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data()?.hasAccess) {
          console.log("✅ Access restored from Firestore");
          localStorage.setItem("hasAccess", "true");
        } else {
          console.log("⚠️ No Firestore record found for access");
        }
      } catch (e) {
        console.warn("AccessSyncer Firestore error:", e);
      }
    });

    return () => unsub();
  }, []);

  return null;
}
