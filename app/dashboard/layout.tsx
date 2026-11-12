"use client";

import React, { useState, useCallback, useMemo } from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";
import { TotalUsageContext } from "../(context)/TotalUsageContext";
import { UserSubscriptionContext } from "../(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "../(context)/UpdateCreditUsageContext";

function Layout({ children }: { children: React.ReactNode }) {
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [userSubscription, setUserSubscription] = useState<boolean>(false);
  const [updateCreditUsage, setUpdateCreditUsage] = useState<any>();
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const handleCloseMobile = useCallback(() => setMobileNavOpen(false), []);
  const handleOpenMobile = useCallback(() => setMobileNavOpen(true), []);

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
          <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07080B] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 relative selection:bg-indigo-600 selection:text-white dark:selection:bg-indigo-500 dark:selection:text-white antialiased">
            {/* Ambient Background Aura */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              {/* Top ambient glow */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent dark:from-indigo-600/15 dark:via-purple-600/5 dark:to-transparent rounded-full blur-3xl opacity-70" />
              {/* Right accent aura */}
              <div className="absolute top-1/4 -right-40 w-[600px] h-[500px] bg-gradient-to-l from-violet-500/5 via-sky-500/5 to-transparent dark:from-violet-600/10 dark:via-blue-600/5 dark:to-transparent rounded-full blur-3xl opacity-60" />
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Desktop Navigation & Mobile Drawer */}
            <SideNav
              mobileOpen={mobileNavOpen}
              onClose={handleCloseMobile}
            />

            {/* Main Application Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full transition-all relative z-10">
              <Header onOpenMobileMenu={handleOpenMobile} />
              <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        </UpdateCreditUsageContext.Provider>
      </UserSubscriptionContext.Provider>
    </TotalUsageContext.Provider>
  );
}

export default Layout;
