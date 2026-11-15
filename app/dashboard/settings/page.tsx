"use client";

import React, { useContext, useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  User,
  Sliders,
  Palette,
  BarChart3,
  Sun,
  Moon,
  Laptop,
  Check,
  Zap,
} from "lucide-react";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

type TabKey = "profile" | "preferences" | "appearance" | "usage";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const { theme, setTheme } = useTheme();
  const { totalUsage } = useContext(TotalUsageContext);
  const { userSubscription } = useContext(UserSubscriptionContext);

  const TABS = [
    { key: "profile", label: "Profile", icon: User },
    { key: "preferences", label: "Preferences", icon: Sliders },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "usage", label: "Usage", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-page-title text-ink font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-body-small text-ink-muted mt-1">
          Manage your account profile, workspace preferences, and appearance.
        </p>
      </div>

      {/* Tab bar (Pill style) */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto [scrollbar-width:none]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? "bg-action text-action-ink shadow-xs"
                  : "bg-surface-elevated text-ink-muted hover:text-ink hover:bg-surface border border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "profile" && (
        <div className="flex justify-center items-center py-2 overflow-x-auto">
          <div className="w-full flex justify-center">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  card: "shadow-xs border border-border rounded-2xl bg-surface text-ink w-full max-w-3xl",
                  navbar: "border-r border-border",
                  headerTitle: "text-ink font-semibold text-base",
                  headerSubtitle: "text-ink-muted text-xs",
                },
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-section-title font-semibold text-ink">Theme</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Select your interface color theme or sync with system preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-colors cursor-pointer ${
                theme === "light"
                  ? "border-action bg-surface-elevated ring-1 ring-action"
                  : "border-border bg-surface hover:border-border-subtle"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-ink">
                  <Sun className="w-4 h-4" strokeWidth={1.5} />
                </div>
                {theme === "light" && <Check className="w-4 h-4 text-action" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Light</h3>
                <p className="text-xs text-ink-muted mt-0.5">Off-white canvas with high-contrast text.</p>
              </div>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-colors cursor-pointer ${
                theme === "dark"
                  ? "border-action bg-surface-elevated ring-1 ring-action"
                  : "border-border bg-surface hover:border-border-subtle"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-ink">
                  <Moon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                {theme === "dark" && <Check className="w-4 h-4 text-action" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Dark</h3>
                <p className="text-xs text-ink-muted mt-0.5">Pure black canvas with obsidian glass.</p>
              </div>
            </button>

            {/* System Mode */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-colors cursor-pointer ${
                theme === "system"
                  ? "border-action bg-surface-elevated ring-1 ring-action"
                  : "border-border bg-surface hover:border-border-subtle"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-ink">
                  <Laptop className="w-4 h-4" strokeWidth={1.5} />
                </div>
                {theme === "system" && <Check className="w-4 h-4 text-action" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">System</h3>
                <p className="text-xs text-ink-muted mt-0.5">Matches operating system settings.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-section-title font-semibold text-ink">Studio Preferences</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Configure default generator behaviors and streaming speeds.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-border">
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-ink">Primary AI Engine</span>
                <p className="text-xs text-ink-muted mt-0.5">Default Gemini model for content generation</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-elevated border border-border text-ink">
                gemini-2.0-flash
              </span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="text-xs font-semibold text-ink">Streaming Animation Throttle</span>
                <p className="text-xs text-ink-muted mt-0.5">Animation frame batching interval</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-elevated border border-border text-ink">
                50ms (Smooth RAF)
              </span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <span className="text-xs font-semibold text-ink">Auto-Save Drafts</span>
                <p className="text-xs text-ink-muted mt-0.5">Persist unsubmitted inputs to local storage</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-elevated text-accent-cyan border border-border font-medium">
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-section-title font-semibold text-ink">Usage &amp; Quotas</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Review current credit usage and subscription limits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-1">
              <span className="text-label text-ink-dim">Current Tier</span>
              <p className="text-lg font-semibold text-ink flex items-center gap-2">
                <span>{userSubscription ? "Astragen Pro" : "Free Starter"}</span>
                {userSubscription && <Zap className="w-4 h-4 text-action" strokeWidth={1.5} />}
              </p>
              <p className="text-xs text-ink-muted">
                {userSubscription ? "Unlimited monthly generations" : "100 credits / month"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-1">
              <span className="text-label text-ink-dim">Total Generated</span>
              <p className="text-lg font-semibold text-ink tabular-nums">
                {Number(totalUsage).toLocaleString()} words
              </p>
              <p className="text-xs text-ink-muted">
                Reset period: First of every month
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
