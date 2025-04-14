"use client";
import React, { useState } from "react";
import SearchSection from "./_components/SearchSection";
import TemplateListSection from "./_components/TemplateListSection";

function Dashboard() {
  const [userSearchInput, setUserSearchInput] = useState<string>("");

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Search Section */}
      <SearchSection onSearchInput={(value: string) => setUserSearchInput(value)} />

      {/* Template List Section */}
      <TemplateListSection userSearchInput={userSearchInput} />
    </div>
  );
}

export default Dashboard;