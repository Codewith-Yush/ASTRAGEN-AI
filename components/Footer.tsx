"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Check,
} from "lucide-react";

interface LinkItem {
  label: string;
  href: string;
  ext?: boolean;
  badge?: string;
}

const PRODUCT_LINKS: LinkItem[] = [
  { label: "Content Studio", href: "/dashboard" },
  { label: "All Templates", href: "/dashboard" },
  { label: "Pro Pricing", href: "/dashboard/billing" },
  { label: "Interactive Demo", href: "/demo" },
  { label: "History Log", href: "/dashboard/history" },
];

const RESOURCE_LINKS: LinkItem[] = [
  { label: "Architecture", href: "/about/technology" },
  { label: "Documentation", href: "/about/learnmore" },
  { label: "System Status", href: "/about/technology#status" },
  { label: "Support & Help", href: "/contact" },
  { label: "GitHub Repo", href: "https://github.com/codewith-yush/Astragen", ext: true },
];

const COMPANY_LINKS: LinkItem[] = [
  { label: "About Astragen", href: "/about/learnmore" },
  { label: "Privacy Policy", href: "/contact" },
  { label: "Terms of Service", href: "/contact" },
  { label: "Security", href: "/about/technology" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  const renderCol = (title: string, links: LinkItem[]) => (
    <div className="space-y-3">
      <span className="text-label text-action">{title}</span>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.ext ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-body-small text-ink-muted hover:text-ink transition-colors"
              >
                <span>{l.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-dim" strokeWidth={1.5} />
              </a>
            ) : (
              <Link
                href={l.href}
                className="inline-flex items-center gap-1 text-body-small text-ink-muted hover:text-ink transition-colors"
              >
                <span>{l.label}</span>
                {l.badge && (
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded-full bg-surface-elevated text-accent-cyan border border-border">
                    {l.badge}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="w-full bg-canvas border-t border-border mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 4-column link grid (collapsing 4 -> 2 -> 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-action text-action-ink flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-base text-ink tracking-tight">
                Astragen AI
              </span>
            </Link>
            <p className="text-body-small text-ink-muted leading-relaxed">
              High-throughput AI generation studio powered by Google Gemini. Built for creators and developers who ship daily.
            </p>
            <div className="flex items-center gap-2 pt-1 text-ink-muted">
              <a
                href="https://github.com/codewith-yush/Astragen"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:text-ink hover:border-border-subtle transition-colors"
              >
                <Github className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.linkedin.com/in/ayush-singh-643a4b25a/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ayush Singh LinkedIn"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:text-ink hover:border-border-subtle transition-colors"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.linkedin.com/in/om-vishwakarma-467b8933b/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Om Vishwakarma LinkedIn"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:text-ink hover:border-border-subtle transition-colors"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <Link
                href="/contact"
                aria-label="Contact us"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:text-ink hover:border-border-subtle transition-colors"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Col 2: Product */}
          {renderCol("PRODUCT", PRODUCT_LINKS)}

          {/* Col 3: Resources */}
          {renderCol("RESOURCES", RESOURCE_LINKS)}

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <span className="text-label text-action">NEWSLETTER</span>
            <p className="text-body-small text-ink-muted leading-relaxed">
              Get prompt recipes, template drops, and architectural updates.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-body-small text-accent-cyan py-2">
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>Subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  aria-label="Email address for newsletter"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-full bg-surface border border-border text-ink placeholder:text-ink-dim focus:outline-none focus:border-action"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-medium bg-action text-action-ink hover:bg-action-hover transition-colors shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legal & Copyright Row */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-body-small text-ink-dim">
          <p>© {new Date().getFullYear()} Astragen AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-ink transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Terms
            </Link>
            <Link href="/about/technology" className="hover:text-ink transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
