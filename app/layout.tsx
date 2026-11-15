import { Poppins, JetBrains_Mono, Space_Grotesk, Archivo_Black, Space_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout"; 
import ClerkProviderWrapper from "@/app/components/ClerkProviderWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata = {
  title: "Astragen AI",
  description: "AI Content Generator",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${archivoBlack.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-canvas text-ink antialiased selection:bg-action/20" suppressHydrationWarning>
        <ClerkProviderWrapper>
          <ClientLayout>{children}</ClientLayout>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
