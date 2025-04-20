import { Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout"; 
import ClerkProviderWrapper from "@/app/components/ClerkProviderWrapper";

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Astragen AI",
  description: "AI Content Generator",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning> {/* ✅ Added here */}
        <ClerkProviderWrapper> {/* ✅ ClerkProvider wrapped inside client component */}
          <ClientLayout>{children}</ClientLayout>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
