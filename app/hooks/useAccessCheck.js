
"use client";

import { useEffect, useState } from "react";

export default function useAccessCheck() {
  const [ready, setReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem("hasAccess") === "true";
    setHasAccess(access);
    setReady(true);
  }, []);

  return { ready, hasAccess };
}
