import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle"; // Import the toggle button



const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CreatorAI",
  description: "AI Content Generator",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="p-4 flex justify-end"> {/* Positioning the button */}
              <ThemeToggle />
            </div>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
