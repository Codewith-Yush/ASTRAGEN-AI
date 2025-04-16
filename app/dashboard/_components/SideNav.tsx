"use client";
import { FileClock, Home, Settings, WalletCards, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import UsageTrack from "./UsageTrack";

function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  const MenuList = [
    {
      id: "home",
      name: "Home",
      icon: Home,
      path: "/dashboard",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      id: "history",
      name: "History",
      icon: FileClock,
      path: "/dashboard/history",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "billing",
      name: "Billing",
      icon: WalletCards,
      path: "/dashboard/billing",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      gradient: "from-orange-400 to-red-500"
    },
  ];

  const path = usePathname();

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white/30 backdrop-blur-md p-2 rounded-full shadow-xl"
      >
        {isOpen ? <X className="text-gray-800" /> : <Menu className="text-gray-800" />}
      </button>

      {/* Desktop Navigation */}
      <nav 
        className={`
          hidden md:block fixed left-0 top-0 h-full 
          bg-white/10 backdrop-blur-xl 
          border-r border-white/20 
          shadow-2xl 
          transition-all duration-300
          z-40
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="logo" 
              width={100} 
              height={100} 
              className="rounded-full shadow-lg"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 flex-grow">
            {MenuList.map((menu) => (
              <Link 
                key={menu.id} 
                href={menu.path}
                className="block"
              >
                <div 
                  className={`
                    flex items-center space-x-3 
                    p-3 rounded-xl 
                    transition-all duration-300 
                    hover:scale-105 
                    ${path === menu.path 
                      ? `bg-gradient-to-r ${menu.gradient} text-white shadow-lg` 
                      : 'bg-white/10 hover:bg-white/20'}
                  `}
                >
                  <div 
                    className={`
                      p-2 rounded-lg 
                      bg-gradient-to-r ${menu.gradient}
                      text-white
                    `}
                  >
                    <menu.icon className="w-6 h-6" />
                  </div>
                  <span className="text-gray-700 font-medium">{menu.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Usage Tracker */}
          <div className="mt-6">
            <UsageTrack />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div 
        className={`
          md:hidden fixed inset-0 z-40 
          bg-white/10 backdrop-blur-xl
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo.jpg" 
              alt="logo" 
              width={120} 
              height={120} 
              className="rounded-full shadow-lg"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 flex-grow">
            {MenuList.map((menu) => (
              <Link 
                key={menu.id} 
                href={menu.path}
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <div 
                  className={`
                    flex items-center space-x-3 
                    p-4 rounded-xl 
                    transition-all duration-300 
                    hover:scale-105 
                    ${path === menu.path 
                      ? `bg-gradient-to-r ${menu.gradient} text-white shadow-lg` 
                      : 'bg-white/10 hover:bg-white/20'}
                  `}
                >
                  <div 
                    className={`
                      p-2 rounded-lg 
                      bg-gradient-to-r ${menu.gradient}
                      text-white
                    `}
                  >
                    <menu.icon className="w-6 h-6" />
                  </div>
                  <span className="text-gray-700 font-medium">{menu.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Usage Tracker */}
          <div className="mt-6">
            <UsageTrack />
          </div>
        </div>
      </div>
    </>
  );
}

export default SideNav;