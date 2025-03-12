"use client"; // ✅ Client Component

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <AnimatePresence mode="wait">{children}</AnimatePresence> : null;
}
