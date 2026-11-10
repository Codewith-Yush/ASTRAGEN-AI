"use client";

import React from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-h-screen">{children}</div>;
}
