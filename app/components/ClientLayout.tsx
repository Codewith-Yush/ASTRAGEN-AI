"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import ClientWrapper from "@/app/components/ClientWrapper";
import TopProgressBar from "@/components/TopProgressBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TopProgressBar />
      <ClientWrapper>{children}</ClientWrapper>
    </ThemeProvider>
  );
}
