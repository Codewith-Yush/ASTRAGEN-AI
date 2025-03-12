"use client";
import React, { useState } from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";
import { TotalUsageContext } from "../(context)/TotalUsageContext";
import { UserSubscriptionContext } from "../(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "../(context)/UpdateCreditUsageContext";

function Layout({ children }: { children: React.ReactNode }) {
  const [totalUsage, setTotalUsage] = useState<Number>(0);
  const [userSubscription, setUserSubscription] = useState<boolean>(false);
  const [updateCreditUsage, setUpdateCreditUsage] = useState<any>();

  return (
    <TotalUsageContext.Provider value={{ totalUsage, setTotalUsage }}>
      <UserSubscriptionContext.Provider value={{ userSubscription, setUserSubscription }}>
        <UpdateCreditUsageContext.Provider value={{ updateCreditUsage, setUpdateCreditUsage }}>
          <div className="bg-slate-100 min-h-screen flex">
            {/* Sidebar (Hidden on Mobile) */}
            <div className="w-64 hidden md:block fixed h-full">
              <SideNav />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 w-full">
              <Header />
              <div className="p-4">{children}</div>
            </div>
          </div>

          {/* Buy Me a Coffee Widget */}
          <script
            data-name="BMC-Widget"
            data-cfasync="false"
            src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
            data-id="ayushsingho"
            data-description="Support me on Buy me a coffee!"
            data-message="You can buy me coffee, If you like this app"
            data-color="#BD5FFF"
            data-position="Right"
            data-x_margin="18"
            data-y_margin="18"
          ></script>
        </UpdateCreditUsageContext.Provider>
      </UserSubscriptionContext.Provider>
    </TotalUsageContext.Provider>
  );
}

export default Layout;
