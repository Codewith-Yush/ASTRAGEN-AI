"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TemplateIcon from "@/components/TemplateIcon";

export interface TemplateCardProps {
  icon?: string;
  name: string;
  desc: string;
  slug: string;
  category?: string;
  featured?: boolean;
  /** position in the visible list (drives the 01, 02, ... numbering) */
  index?: number;
}

function TemplateCard({
  name,
  desc,
  slug,
  category = "AI Engine",
  featured = false,
  index = 0,
}: TemplateCardProps) {
  const wide = featured || slug === "code-generator";
  const num = String(index + 1).padStart(2, "0");

  // Feeds the grey cursor light (--mx / --my)
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <Link
      href={`/dashboard/content/${slug}`}
      aria-label={`Open ${name} template`}
      className={`group flex outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action ${
        wide ? "ed-span2" : ""
      }`}
    >
      <article
        onPointerMove={onPointerMove}
        style={{ ["--i" as any]: index }}
        className={`ed-cell ${wide ? "ed-cell--wide" : ""}`}
      >
        <span className="ed-clip" aria-hidden="true">
          <span className="ed-glow" />
          <span className="ed-ghost">{num}</span>
        </span>
        <span className="ed-plus" aria-hidden="true" />

        <div className="ed-top">
          <span className="ed-ic" aria-hidden="true">
            <TemplateIcon slug={slug} className="" />
          </span>
          <span className="ed-num">{num}</span>
        </div>

        <div>
          <p className="ed-eyebrow">{category}</p>
          <h3 className="ed-title">{name}</h3>
          <p className="ed-desc">{desc}</p>
        </div>

        <span className="ed-go" aria-hidden="true">
          <span>Open</span>
          <ArrowUpRight strokeWidth={1.5} />
        </span>
      </article>
    </Link>
  );
}

export default React.memo(TemplateCard);