"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const previousPathname = useRef(pathname);

  // When pathname changes, show a snappy progress animation that completes quickly
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setVisible(true);
      setProgress(70);

      const finishTimer = setTimeout(() => {
        setProgress(100);
      }, 50);

      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);

      return () => {
        clearTimeout(finishTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/50 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "200ms",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
