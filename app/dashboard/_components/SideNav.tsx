"use client";

import { FileClock, Home, Settings, WalletCards } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import UsageTrack from "./UsageTrack";

function SideNav() {
  const MenuList = [
    {
      id: "home",
      name: "Home",
      icon: Home,
      path: "/dashboard",
    },
    {
      id: "history",
      name: "History",
      icon: FileClock,
      path: "/dashboard/history",
    },
    {
      id: "billing",
      name: "Billing",
      icon: WalletCards,
      path: "/dashboard/billing",
    },
    {
      id: "settings",
      name: "Setting",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, [path]); // ✅ Dependency array me path add kiya

  return (
    <div className="h-screen relative p-5 shadow-sm border bg-white">
      {/* Logo */}
      <div className="flex justify-center">
        <Image src="/logo.jpg" alt="logo" width={120} height={100} />
      </div>
      <hr className="my-6 border" />

      {/* Navigation Menu */}
      <div className="mt-3">
        {MenuList.map((menu) => (
          <Link key={menu.id} href={menu.path}> {/* ✅ Added key */}
            <div
              className={`flex gap-2 mb-2 p-3
              hover:bg-primary hover:text-white rounded-lg
              cursor-pointer items-center
              ${path === menu.path ? "bg-primary text-white" : ""}
            `}
            >
              <menu.icon className="h-6 w-6" /> {/* ✅ Correct icon rendering */}
              <h2 className="text-lg">{menu.name}</h2>
            </div>
          </Link>
        ))}
      </div>

      {/* Usage Tracker */}
      <div className="absolute bottom-10 left-0 w-full">
        <UsageTrack />
      </div>
    </div>
  );
}

export default SideNav;
