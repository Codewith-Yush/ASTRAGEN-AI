"use client";

import React, { useState, useCallback } from "react";
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

  return (
    <TotalUsageContext.Provider value={{ totalUsage, setTotalUsage }}>
      <UserSubscriptionContext.Provider value={{ userSubscription, setUserSubscription }}>
        <UpdateCreditUsageContext.Provider value={{ updateCreditUsage, setUpdateCreditUsage }}>
          <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
            {/* Desktop Navigation & Mobile Drawer */}
            <SideNav
              mobileOpen={mobileNavOpen}
              onClose={handleCloseMobile}
            />

            {/* Main Application Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full transition-all">
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
