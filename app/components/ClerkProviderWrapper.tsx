"use client";  // ✅ Ensure yeh likha ho

import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/utils/clerkAppearance";

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
}
