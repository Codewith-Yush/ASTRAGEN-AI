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
      {/* Apply the same gradient background as the hero section */}
      <div className="min-h-screen bg-gradient-to-b from-[#FFDADA] to-[#AEE2FF] dark:from-slate-900 dark:to-slate-800">
        {/* Theme toggle container */}
        <div className="p-4 flex justify-end">
          <ThemeToggle />
        </div>
        
        {/* Main content */}
        <ClientWrapper>{children}</ClientWrapper>
      </div>
    </ThemeProvider>
  );
}