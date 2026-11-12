"use client";

import React, { useState, useCallback, useDeferredValue } from "react";
import SearchSection from "./_components/SearchSection";
import TemplateListSection from "./_components/TemplateListSection";

function Dashboard() {
  const [userSearchInput, setUserSearchInput] = useState<string>("");
  const deferredSearchInput = useDeferredValue(userSearchInput);

  const handleSearchInput = useCallback((value: string) => {
    setUserSearchInput(value);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Search & Hero Banner */}
      <SearchSection onSearchInput={handleSearchInput} />

      {/* Templates Category & Bento Grid */}
      <TemplateListSection userSearchInput={deferredSearchInput} />
    </div>
  );
}

export default Dashboard;
