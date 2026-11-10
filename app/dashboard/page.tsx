"use client";

import React, { useState } from "react";
import SearchSection from "./_components/SearchSection";
import TemplateListSection from "./_components/TemplateListSection";

function Dashboard() {
  const [userSearchInput, setUserSearchInput] = useState<string>("");

  return (
    <div className="w-full space-y-4">
      {/* Search & Hero Banner */}
      <SearchSection onSearchInput={(value: string) => setUserSearchInput(value)} />

      {/* Templates Category & Bento Grid */}
      <TemplateListSection userSearchInput={userSearchInput} />
    </div>
  );
}

export default Dashboard;
