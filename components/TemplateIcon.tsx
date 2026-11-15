"use client";

import React from "react";
import {
  FileText,
  Heading,
  CalendarCheck,
  Calendar,
  Network,
  ListOrdered,
  FileEdit,
  HelpCircle,
  Video,
  Hash,
  Clapperboard,
  RefreshCw,
  Share2,
  UserCheck,
  Instagram,
  Sparkles,
  Twitter,
  Code2,
  FileCode,
  Bug,
  Flame,
  ShoppingBag,
  Search,
  Globe,
  Briefcase,
  FlaskConical,
  Image as ImageIcon,
  Bot,
  Mic,
  Users,
  Layers,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "blog-title-generator": Heading,
  "blog-content-creator": FileText,
  "assignment-planner": CalendarCheck,
  "study-schedule-planner": Calendar,
  "concept-map-creator": Network,
  "essay-outline-builder": ListOrdered,
  "study-note-generator": FileEdit,
  "comprehensive-quiz-generator": HelpCircle,
  "youtube-description-generator": Video,
  "youtube-tag-generator": Hash,
  "youtube-shorts-script-generator": Clapperboard,
  "article-rewriter": RefreshCw,
  "linkedin-post-generator": Share2,
  "linkedin-profile-optimizer": UserCheck,
  "instagram-post-generator": Instagram,
  "instagram-hashtag-generator": Hash,
  "instagram-content-idea-generator": Sparkles,
  "viral-tweet-thread": Twitter,
  "code-generator": Code2,
  "code-explainer": FileCode,
  "code-bug-detector": Bug,
  "tagline-generator": Flame,
  "product-description-generator": ShoppingBag,
  "seo-content-optimizer": Search,
  "language-drill-generator": Globe,
  "case-study-generator": Briefcase,
  "research-paper-analyzer": FlaskConical,
  "ai-image-prompt-generator": ImageIcon,
  "ai-prompt-engineer": Bot,
  "podcast-episode-planner": Mic,
  "meeting-agenda-creator": Users,
  "content-repurposer": Layers,
};

interface TemplateIconProps {
  slug: string;
  className?: string;
  size?: number;
}

export default function TemplateIcon({ slug, className = "w-5 h-5", size }: TemplateIconProps) {
  const Icon = ICON_MAP[slug] || Sparkles;
  return <Icon className={className} size={size} strokeWidth={1.5} />;
}
