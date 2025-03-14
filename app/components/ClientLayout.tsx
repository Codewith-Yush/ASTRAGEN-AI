"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";
import ClientWrapper from "@/app/components/ClientWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="p-4 flex justify-end">
        <ThemeToggle />
      </div>
      <ClientWrapper>{children}</ClientWrapper>
    </ThemeProvider>
  );
}
