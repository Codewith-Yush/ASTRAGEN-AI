"use client";

import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            {children}
            <ThemeToggle />
        </ThemeProvider>
    );
}
