"use client";
import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function DebugPage() {
  useEffect(() => {
    const run = async () => {
      console.clear();
      console.log("➡️ Auth state:", auth.currentUser);

      // wait a moment for Firebase to restore login
      await new Promise((r) => setTimeout(r, 1500));
      const user = auth.currentUser;
      if (!user) {
        alert("Not logged in when writing. Log in, then refresh /debug");
        return;
      }

      try {
        console.log("📡 Trying to write to Firestore...");
        await setDoc(doc(db, "purchases", user.uid), {
          manualTest: true,
          email: user.email,
          time: new Date().toISOString(),
        });
        alert("✅ Firestore write SUCCESS!");
      } catch (err) {
        console.error("❌ Firestore write FAILED:", err);
        alert("❌ Firestore write FAILED. Check console for details.");
      }
    };
    run();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Firestore Connectivity Test</h1>
      <p>Open the browser console before loading this page.</p>
    </main>
  );
}
