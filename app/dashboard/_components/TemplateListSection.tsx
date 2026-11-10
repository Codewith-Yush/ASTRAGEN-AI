"use client";

import React, { useMemo, useState } from "react";
import Templates from "@/app/(data)/Templates";
import TemplateCard from "./TemplateCard";
import { Sparkles, RotateCcw } from "lucide-react";

export interface TEMPLATE {
  name: string;
  desc: string;
  icon: string;
  category: string;
  slug: string;
  aiPrompt: string;
  form?: FORM[];
}

export interface FORM {
  label: string;
  field: string;
  name: string;
  required?: boolean;
}

const CATEGORIES = [
  "All",
  "Blog",
  "Social Media",
  "Writing",
  "Coding",
  "Marketing",
  "Education",
  "YouTube",
];

function TemplateListSection({ userSearchInput }: { userSearchInput: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const templateList = useMemo(() => {
    return Templates.filter((item) => {
      const matchesSearch = userSearchInput
        ? item.name.toLowerCase().includes(userSearchInput.toLowerCase()) ||
          item.desc.toLowerCase().includes(userSearchInput.toLowerCase()) ||
          item.category.toLowerCase().includes(userSearchInput.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [userSearchInput, selectedCategory]);

  return (
    <section className="space-y-6 pt-2 pb-12">
      {/* Category Pills & Count Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95
                  ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                      : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 self-end sm:self-auto">
          Showing{" "}
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {templateList.length}
          </span>{" "}
          templates
        </div>
      </div>

      {/* Grid of Templates */}
      {templateList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {templateList.map((item: TEMPLATE) => (
            <TemplateCard
              key={item.slug || item.name}
              icon={item.icon}
              name={item.name}
              desc={item.desc}
              slug={item.slug}
              category={item.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 md:py-20 bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No templates found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We couldn't find any templates matching "{userSearchInput}". Try another keyword or reset filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default React.memo(TemplateListSection);
