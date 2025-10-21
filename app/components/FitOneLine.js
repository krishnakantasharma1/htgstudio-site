"use client";
import { useEffect, useRef, useState } from "react";

export default function FitOneLine({ children, maxScale = 1, minScale = 0.6, className = "" }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current;
      const text = textRef.current;
      if (!wrap || !text) return;

      setScale(maxScale);
      requestAnimationFrame(() => {
        const w = wrap.clientWidth;
        const tw = text.scrollWidth;
        const next = Math.min(maxScale, Math.max(minScale, w / tw));
        setScale(next);
      });
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [maxScale, minScale, children]);

  return (
    <div ref={wrapRef} className={`w-full overflow-hidden ${className}`}>
      <span
        ref={textRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {children}
      </span>
    </div>
  );
}
