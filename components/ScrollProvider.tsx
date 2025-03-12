"use client";  // ✅ Ensure this is a Client Component

import { useEffect, useRef } from "react";
import { useLocomotiveScroll } from "@/app/hooks/useLocomotiveScroll";

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollRef } = useLocomotiveScroll(); // ✅ Use the hook

  return <div ref={scrollRef}>{children}</div>;
}
