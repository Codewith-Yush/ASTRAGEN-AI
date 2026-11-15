"use client";

import React, { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";
import CommandPalette from "@/components/CommandPalette";
import { TotalUsageContext } from "../(context)/TotalUsageContext";
import { UserSubscriptionContext } from "../(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "../(context)/UpdateCreditUsageContext";

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [userSubscription, setUserSubscription] = useState<boolean>(false);
  const [updateCreditUsage, setUpdateCreditUsage] = useState<any>();
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleCloseMobile = useCallback(() => setMobileNavOpen(false), []);
  const handleOpenMobile = useCallback(() => setMobileNavOpen(true), []);
  const handleToggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  // The workbench (template pages) uses the full area below the header.
  const isWorkbench = pathname.startsWith("/dashboard/content");

  const totalUsageContextValue = useMemo(
    () => ({ totalUsage, setTotalUsage }),
    [totalUsage]
  );
  const userSubscriptionContextValue = useMemo(
    () => ({ userSubscription, setUserSubscription }),
    [userSubscription]
  );
  const updateCreditUsageContextValue = useMemo(
    () => ({ updateCreditUsage, setUpdateCreditUsage }),
    [updateCreditUsage]
  );

  return (
    <TotalUsageContext.Provider value={totalUsageContextValue}>
      <UserSubscriptionContext.Provider value={userSubscriptionContextValue}>
        <UpdateCreditUsageContext.Provider value={updateCreditUsageContextValue}>
          <div className="min-h-screen bg-canvas text-ink flex transition-colors duration-150 relative antialiased">
            <SideNav
              mobileOpen={mobileNavOpen}
              onClose={handleCloseMobile}
              collapsed={collapsed}
              onToggleCollapse={handleToggleCollapse}
            />

            {/* Offsets must match the sidebar widths in SideNav (w-14 / w-[232px]) */}
            <div
              className={`flex-1 flex flex-col min-h-screen min-w-0 w-full transition-[padding] duration-150 ${
                collapsed ? "md:pl-14" : "md:pl-[232px]"
              }`}
            >
              <Header onOpenMobileMenu={handleOpenMobile} />
              <main
                className={
                  isWorkbench
                    ? "flex-1 w-full"
                    : "flex-1 p-4 sm:p-6 md:px-8 md:py-6 max-w-7xl w-full mx-auto"
                }
              >
                {children}
              </main>
            </div>

            <CommandPalette />
          </div>
        </UpdateCreditUsageContext.Provider>
      </UserSubscriptionContext.Provider>
    </TotalUsageContext.Provider>
  );
}

export default Layout;