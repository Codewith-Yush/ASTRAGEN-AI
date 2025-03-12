import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/app/components/ThemeToggle";
import ClientWrapper from "@/app/components/ClientWrapper"; // ✅ Import new Client Component

const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrafterAi",
  description: "AI Content Generator",
  icons: {
    icon: '/favicon.ico', // This is where you set the favicon
  },  
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="p-4 flex justify-end">
              <ThemeToggle />
            </div>

            {/* ✅ Wrap children inside ClientWrapper */}
            <ClientWrapper>{children}</ClientWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
