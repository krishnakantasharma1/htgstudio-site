"use client";

import { useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TrackedVideo({ src, videoId, courseId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const saveProgress = setInterval(async () => {
      const user = auth.currentUser;
      if (!user || !video.duration) return;

      const watched = video.currentTime / 60; // minutes
      const duration = video.duration / 60; // total minutes

      const docRef = doc(db, "courseProgress", `${user.uid}_${courseId}`);
      const snap = await getDoc(docRef);

      const existingData = snap.exists() ? snap.data().videos || {} : {};
      existingData[videoId] = { watched, duration };

      await setDoc(
        docRef,
        {
          userId: user.uid,
          courseId,
          videos: existingData,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    }, 10000); // every 10 seconds

    return () => clearInterval(saveProgress);
  }, [videoId, courseId]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="rounded-lg w-full shadow-md"
    />
  );
}

