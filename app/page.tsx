"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  useAnimationFrame,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import LandingNavbar from "@/components/LandingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Play,
  Check,
  Zap,
  Layers,
  Sliders,
  FileText,
  Share2,
  Terminal,
  ShieldCheck,
  MessageSquare,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* DESIGN TOKENS                                                        */
/* ------------------------------------------------------------------ */
const C = {
  cream: "#FFF4E0",
  yellow: "#FFE500",
  pink: "#FF6AD5",
  blue: "#3B3BFF",
  green: "#00E676",
  orange: "#FF5C00",
  black: "#000000",
};

const SHADOW = "shadow-[6px_6px_0_0_#000]";
const SHADOW_LG = "shadow-[10px_10px_0_0_#000]";
const BORDER = "border-[3px] border-black";

/* ------------------------------------------------------------------ */
/* DATA                                                                 */
/* ------------------------------------------------------------------ */
interface FeatureItem {
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  bg: string;
}
interface UseCase {
  tag: string;
  title: string;
  description: string;
  image: string;
  bg: string;
}
interface Testimonial {
  quote: string;
  author: string;
  role: string;
  tag: string;
  image: string;
  bg: string;
  rotate: number;
}
interface Plan {
  name: string;
  price: string;
  period: string;
  tag: string;
  features: string[];
  featured: boolean;
  cta: string;
  href: string;
  bg: string;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    tag: "ENGINE // 01",
    title: "Gemini 2.0 Streaming",
    description:
      "Real-time token generation at 100+ tokens/sec with markdown syntax rendering and live code highlighting.",
    icon: Zap,
    bg: C.yellow,
  },
  {
    tag: "WORKFLOW // 02",
    title: "50+ Specialized Engines",
    description:
      "Pre-engineered prompt templates for blogs, SEO meta, YouTube scripts, social copy, and code synthesis.",
    icon: Layers,
    bg: C.pink,
  },
  {
    tag: "PRECISION // 03",
    title: "Split-Studio Workbench",
    description:
      "Adjust inputs, tone, audience, and length on the left; stream, edit, copy, and export on the right.",
    icon: Sliders,
    bg: C.green,
  },
  {
    tag: "STORAGE // 04",
    title: "Neon Postgres History",
    description:
      "Instant persistence with Drizzle ORM. Search, retrieve, and re-export past content anytime.",
    icon: FileText,
    bg: "#7DD3FC",
  },
  {
    tag: "SECURITY // 05",
    title: "Clerk Enterprise Auth",
    description:
      "Seamless Google, GitHub, and email sign-in with granular session protection and secure subscription tracking.",
    icon: ShieldCheck,
    bg: C.orange,
  },
  {
    tag: "INTEGRATION // 06",
    title: "One-Click Formats",
    description:
      "Instant export to Markdown, rich text, HTML, and clipboard with clean syntax highlighting.",
    icon: Share2,
    bg: "#C4B5FD",
  },
];

const USE_CASES: UseCase[] = [
  {
    tag: "LONG_FORM",
    title: "SEO Blog Posts & Articles",
    description:
      "Generate structured, authoritative articles with headings, outlines, keywords, and publication-ready formatting.",
    image: "/blog.jpg",
    bg: C.yellow,
  },
  {
    tag: "MARKETING",
    title: "High-Converting Ad Copy",
    description:
      "Produce irresistible ad variations, email drip sequences, landing page headers, and social announcements.",
    image: "/marketing.png",
    bg: C.pink,
  },
  {
    tag: "CREATIVE",
    title: "Storytelling & Scripts",
    description:
      "Draft YouTube scripts, TikTok concepts, podcast talking points, and creative essays with customizable tone.",
    image: "/writing.jpg",
    bg: C.green,
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The dual-pane split studio feels like a genuine power tool. I generate complete blog outlines and technical drafts in seconds.",
    author: "Rajendra T.",
    role: "Computer Science Researcher",
    tag: "RESEARCHER",
    image: "/raju.jpg",
    bg: C.yellow,
    rotate: -2,
  },
  {
    quote:
      "Astragen replaced 4 separate tools for my content workflow. The Gemini-powered speed and clean markdown view are incredible.",
    author: "Kuldeep Y.",
    role: "Full-Stack Engineer",
    tag: "ENGINEERING",
    image: "/kuldeep.jpg",
    bg: C.pink,
    rotate: 1.5,
  },
  {
    quote:
      "As a creator, consistency is everything. Having 50+ templates with instant export saves me at least 15 hours every week.",
    author: "Nitin G.",
    role: "YouTube Tech Creator",
    tag: "CREATOR",
    image: "/nitin.jpg",
    bg: C.green,
    rotate: -1,
  },
];

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "forever free",
    tag: "COMMUNITY",
    features: [
      "300,000 words per month",
      "Access to all 50+ AI templates",
      "Split-screen live markdown editor",
      "Complete generation history log",
      "Standard community support",
    ],
    featured: false,
    cta: "Start Free",
    href: "/dashboard",
    bg: "#FFFFFF",
  },
  {
    name: "Pro Studio",
    price: "$19",
    period: "per month",
    tag: "RECOMMENDED",
    features: [
      "Unlimited word generation",
      "Priority Gemini 2.0 streaming throughput",
      "Advanced code & long-form modes",
      "Unlimited history & persistent export",
      "Dedicated 24/7 technical support",
    ],
    featured: true,
    cta: "Upgrade to Pro",
    href: "/dashboard/billing",
    bg: C.yellow,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "per month",
    tag: "TEAMS",
    features: [
      "Everything in Pro Studio",
      "Custom brand voice injection",
      "Team workspace sharing",
      "Dedicated API key access",
      "SLA guarantee & priority features",
    ],
    featured: false,
    cta: "Contact Sales",
    href: "/contact",
    bg: "#FFFFFF",
  },
];

const DEVELOPERS = [
  {
    name: "Ayush Singh",
    role: "Core Platform Architect",
    image: "/Ayush.jpeg",
    bio: "Passionate about creating intuitive, high-performance user experiences through clean code and modern AI workflows.",
    github: "https://github.com/codewith-yush",
    linkedin: "https://www.linkedin.com/in/ayush-singh-643a4b25a/",
    bg: C.pink,
  },
  {
    name: "Om Vishwakarma",
    role: "Systems & Full-Stack Engineer",
    image: "/om.png",
    bio: "Dedicated to building scalable backend infrastructure, real-time AI pipelines, and seamless developer tooling.",
    github: "https://github.com/om-999",
    linkedin: "https://www.linkedin.com/in/om-vishwakarma-467b8933b/",
    bg: C.green,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Select Content Engine",
    desc: "Choose from 50+ templates fine-tuned for blogs, YouTube scripts, social threads, or code synthesis.",
    bg: C.yellow,
    rotate: -1.5,
  },
  {
    step: "02",
    title: "Define Tone & Parameters",
    desc: "Fill custom fields like topic, audience, keywords, and length to steer the AI output precisely.",
    bg: C.pink,
    rotate: 1,
  },
  {
    step: "03",
    title: "Stream, Refine & Export",
    desc: "Watch the markdown stream in real-time. Edit, format, copy to clipboard, or export with one click.",
    bg: C.green,
    rotate: -0.8,
  },
];

/* ------------------------------------------------------------------ */
/* SMALL BUILDING BLOCKS                                                */
/* ------------------------------------------------------------------ */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.07 },
  }),
};

/** Mask-reveal headline. Screen readers get plain text; the animated words are hidden from them. */
function RevealText({
  text,
  className = "",
  delay = 0,
  inView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  const words = text.split(" ");
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-80px" } }
    : { animate: "show" };
  return (
    <span className={`inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <m.span aria-hidden="true" initial="hidden" {...trigger} className="inline-block">
        {words.map((w, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
          >
            <m.span
              className="inline-block"
              variants={{
                hidden: { y: "115%", rotate: 4 },
                show: {
                  y: "0%",
                  rotate: 0,
                  transition: { duration: 0.7, ease: EASE, delay: delay + i * 0.06 },
                },
              }}
            >
              {w}
              {i < words.length - 1 ? "\u00A0" : ""}
            </m.span>
          </span>
        ))}
      </m.span>
    </span>
  );
}

/** Button with the classic neo-brutal "press" interaction. */
function NBButton({
  href,
  children,
  bg = "#fff",
  color = "#000",
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  bg?: string;
  color?: string;
  className?: string;
  external?: boolean;
}) {
  const cls = `inline-flex items-center justify-center gap-2 px-7 py-4 ${BORDER} ${SHADOW} font-mono-nb font-bold uppercase text-sm tracking-wide
    hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_#000]
    active:translate-x-[6px] active:translate-y-[6px] active:shadow-none
    focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#3B3BFF]
    transition-[transform,box-shadow] duration-150 ${className}`;
  const style = { background: bg, color };
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls} style={style}>
      {children}
    </Link>
  );
}

function Tag({
  children,
  bg = "#fff",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block font-mono-nb text-xs font-bold uppercase tracking-widest px-3 py-1 ${BORDER} shadow-[3px_3px_0_0_#000] ${className}`}
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/** Infinite marquee whose speed + direction react to scroll velocity. Decorative, so hidden from AT. */
function VelocityMarquee({
  items,
  baseVelocity = -4,
  bg,
  rotate = 0,
}: {
  items: string[];
  baseVelocity?: number;
  bg: string;
  rotate?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "150px" });
  const shouldReduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (!isInView || shouldReduceMotion || (typeof document !== "undefined" && document.hidden)) {
      return;
    }
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const row = (
    <div className="flex shrink-0 items-center">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center font-display text-3xl sm:text-5xl uppercase px-6">
          {t}
          <Star className="ml-12 w-8 h-8 fill-black" />
        </span>
      ))}
    </div>
  );

  return (
    // Outer clip stops the rotated band from causing horizontal page scroll.
    <div className="relative z-10 overflow-x-clip py-3" aria-hidden="true" ref={containerRef}>
      <div
        className="-mx-[3%] w-[106%] overflow-hidden whitespace-nowrap border-y-[3px] border-black py-4 select-none"
        style={{ background: bg, transform: `rotate(${rotate}deg)` }}
      >
        <m.div style={{ x, willChange: "transform" }} className="flex w-max">
          {row}
          {row}
        </m.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTIONS                                                             */
/* ------------------------------------------------------------------ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX, background: C.pink }}
      className="fixed top-0 left-0 right-0 h-2 origin-left z-[100] border-b-[3px] border-black pointer-events-none"
    />
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const k = reduce ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yStar = useTransform(scrollYProgress, [0, 1], [0, -220 * k]);
  const ySticker = useTransform(scrollYProgress, [0, 1], [0, -120 * k]);
  const yMock = useTransform(scrollYProgress, [0, 1], [0, 90 * k]);
  const rotStar = useTransform(scrollYProgress, [0, 1], [0, 160 * k]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#FFF4E0] border-b-[3px] border-black pt-14 pb-24 sm:pt-20 sm:pb-32"
    >
      <div className="absolute inset-0 nb-dots opacity-[0.12] pointer-events-none" aria-hidden="true" />

      {/* parallax stickers (decorative) */}
      <m.div
        aria-hidden="true"
        style={{ y: yStar, rotate: rotStar, background: C.yellow }}
        className={`hidden md:flex absolute left-[4%] top-28 w-24 h-24 ${BORDER} ${SHADOW} items-center justify-center rounded-full`}
      >
        <Sparkles className="w-10 h-10" />
      </m.div>
      <m.div
        aria-hidden="true"
        style={{ y: ySticker, background: C.pink }}
        className={`hidden md:block absolute right-[5%] top-40 px-4 py-2 rotate-6 ${BORDER} ${SHADOW} font-mono-nb font-bold uppercase text-sm`}
      >
        50+ engines ★
      </m.div>
      <m.div
        aria-hidden="true"
        style={{ y: yStar, background: C.green }}
        className={`hidden lg:block absolute left-[8%] bottom-40 px-4 py-2 -rotate-6 ${BORDER} ${SHADOW} font-mono-nb font-bold uppercase text-sm`}
      >
        100+ tokens/sec
      </m.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <m.div
          initial={{ opacity: 0, y: -20, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <Tag bg={C.yellow}>
            <Sparkles className="inline w-3.5 h-3.5 -mt-0.5 mr-1.5" />
            Astragen Studio // Powered by Gemini 2.0
          </Tag>
        </m.div>

        <h1 className="font-display text-[clamp(2.4rem,9vw,7.5rem)] leading-[0.95] uppercase max-w-5xl mx-auto">
          <RevealText text="AI Content" />
          <br />
          <RevealText text="Creation," delay={0.12} />{" "}
          <span
            className="inline-block px-3 -rotate-2 border-[3px] border-black shadow-[8px_8px_0_0_#000]"
            style={{ background: C.blue, color: "#fff" }}
          >
            <RevealText text="Reimagined." delay={0.28} />
          </span>
        </h1>

        <m.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="font-body mt-10 text-lg sm:text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-snug"
        >
          A high-speed generative workbench with{" "}
          <mark className="px-1 bg-[#FFE500] text-black">50+ specialized engines</mark>. Generate
          articles, ad copy, scripts, and code in clean markdown in seconds.
        </m.p>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 relative"
        >
          <NBButton href="/dashboard" bg={C.yellow} className="w-full sm:w-auto">
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </NBButton>
          <NBButton href="/demo" bg="#fff" className="w-full sm:w-auto">
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Demo</span>
          </NBButton>

          {/* rotating stamp */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute -right-28 -top-14 w-28 h-28 pointer-events-none select-none"
          >
            <m.svg
              className="w-full h-full"
              viewBox="0 0 120 120"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            >
              <path
                id="stampPath"
                d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
                fill="none"
              />
              <text className="font-mono-nb" style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700 }}>
                <textPath href="#stampPath">★ GEMINI 2.0 FLASH ★ ASTRAGEN AI ★</textPath>
              </text>
            </m.svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-9 h-9 rounded-full ${BORDER} flex items-center justify-center`}
                style={{ background: C.pink }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        </m.div>

        {/* product mockup: purely illustrative, hidden from assistive tech */}
        <m.div style={{ y: yMock }} className="mt-20 sm:mt-24" aria-hidden="true">
          <m.div
            initial={{ opacity: 0, y: 60, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className={`max-w-5xl mx-auto bg-white ${BORDER} ${SHADOW_LG} text-left`}
          >
            <div
              className="h-12 px-4 flex items-center justify-between border-b-[3px] border-black"
              style={{ background: C.yellow }}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#FF5F56] border-2 border-black" />
                <span className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-black" />
                <span className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-black" />
              </div>
              <div className="flex-1 max-w-md mx-4 bg-white border-2 border-black px-3 py-1 font-mono-nb text-[11px] sm:text-xs text-center truncate">
                https://astragen.ai/dashboard/studio
              </div>
              <div className="hidden sm:flex items-center gap-1.5 font-mono-nb text-[11px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] border-2 border-black animate-pulse motion-reduce:animate-none" />
                ONLINE
              </div>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 bg-[#FFF4E0]">
              <div className={`md:col-span-5 bg-white ${BORDER} p-4 space-y-3`}>
                <div className="flex items-center justify-between border-b-[3px] border-black pb-2">
                  <span className="font-mono-nb text-xs font-bold uppercase">Engine Input</span>
                  <span
                    className="font-mono-nb text-[10px] font-bold border-2 border-black px-2 py-0.5"
                    style={{ background: C.pink }}
                  >
                    BLOG_POST
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block font-mono-nb text-[11px] font-bold">Topic / Title</span>
                  <div className="border-2 border-black px-3 py-2 text-xs font-body bg-[#FFF4E0]">
                    Next.js 15 Full-Stack Architecture Guide
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block font-mono-nb text-[11px] font-bold">Tone &amp; Audience</span>
                  <div className="border-2 border-black px-3 py-2 text-xs font-body bg-[#FFF4E0] flex justify-between">
                    <span>Technical &amp; Direct</span>
                    <span className="font-bold" style={{ color: C.blue }}>
                      Senior Devs
                    </span>
                  </div>
                </div>
                <div
                  className={`mt-2 py-2.5 ${BORDER} shadow-[4px_4px_0_0_#000] font-mono-nb text-xs font-bold uppercase text-center flex items-center justify-center gap-2`}
                  style={{ background: C.blue, color: "#fff" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate With Gemini
                </div>
              </div>

              <div className={`md:col-span-7 bg-white ${BORDER} p-4 flex flex-col justify-between`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b-[3px] border-black pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span className="font-mono-nb text-xs font-bold uppercase">Markdown Live Stream</span>
                    </div>
                    <span
                      className="font-mono-nb text-[10px] font-bold border-2 border-black px-2 py-0.5"
                      style={{ background: C.green }}
                    >
                      100% DONE
                    </span>
                  </div>
                  <div className="space-y-2 text-xs font-mono-nb">
                    <p className="font-bold text-sm"># Building Scalable Apps with Next.js 15 &amp; React 19</p>
                    <p className="text-black/70">
                      Next.js 15 introduces server actions, enhanced caching controls, and streaming responses...
                    </p>
                    <pre className="bg-black text-[#00E676] p-3 text-[11px] border-2 border-black overflow-x-auto">
                      <code>{`export async function generateContent(prompt: string) {
  return await gemini.stream({ prompt });
}`}</code>
                    </pre>
                  </div>
                </div>
                <div className="pt-4 mt-3 flex items-center justify-between border-t-[3px] border-black font-mono-nb text-[11px] font-bold">
                  <span>1,420 words</span>
                  <span>Copy Markdown • Download .MD</span>
                </div>
              </div>
            </div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 bg-[#FFE500] border-b-[3px] border-black relative overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 nb-dots opacity-[0.1] pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Tag bg="#fff">Social proof // Voices of the creators</Tag>
        <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-6 leading-[0.95] max-w-4xl mx-auto">
          <RevealText inView text="The fastest, most focused generative workbench ever built." />
        </h2>
        <p className="font-body mt-6 text-lg font-medium max-w-2xl mx-auto">
          Trusted by developers, students, content writers, and YouTube creators who demand high output
          speed and clean markdown.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {TESTIMONIALS.map((t, i) => (
            <m.figure
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ rotate: 0, y: -10, transition: { duration: 0.2 } }}
              className={`flex flex-col justify-between p-7 ${BORDER} ${SHADOW_LG}`}
              style={{ background: t.bg, rotate: t.rotate }}
            >
              <div>
                <span className="inline-block font-mono-nb text-[11px] font-bold uppercase bg-black text-white px-2 py-1 mb-4">
                  {"// "}
                  {t.tag}
                </span>
                <blockquote className="font-body text-lg font-bold leading-snug">“{t.quote}”</blockquote>
              </div>
              <figcaption className="mt-8 pt-5 border-t-[3px] border-black flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 overflow-hidden border-[3px] border-black bg-white shrink-0">
                    <Image src={t.image} alt={t.author} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-display text-sm uppercase leading-tight">{t.author}</p>
                    <p className="font-mono-nb text-[11px] font-bold">{t.role}</p>
                  </div>
                </div>
                <span className="font-mono-nb text-[10px] font-bold uppercase px-2 py-1 border-2 border-black bg-white">
                  Verified
                </span>
              </figcaption>
            </m.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-[#FFF4E0] scroll-mt-20 border-b-[3px] border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <Tag bg={C.pink}>Features // Capabilities</Tag>
          <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-6 leading-[0.95]">
            <RevealText inView text="Built for speed. Tuned for accuracy." />
          </h2>
          <p className="font-body mt-6 text-lg font-medium">
            Astragen gives you complete creative autonomy through specialized AI engines engineered on top
            of Google Gemini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_ITEMS.map((f, i) => {
            const Icon = f.icon;
            return (
              <m.div
                key={i}
                variants={fadeUp}
                custom={i % 3}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ x: 6, y: 6, transition: { duration: 0.12 } }}
                className={`group flex flex-col justify-between p-7 ${BORDER} ${SHADOW} hover:shadow-[0_0_0_0_#000] transition-shadow duration-150 bg-white`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <m.div
                      whileHover={{ rotate: [0, -12, 12, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 ${BORDER} flex items-center justify-center`}
                      style={{ background: f.bg }}
                    >
                      <Icon className="w-7 h-7" aria-hidden="true" />
                    </m.div>
                    <span className="font-mono-nb text-[11px] font-bold">{f.tag}</span>
                  </div>
                  <h3 className="font-display uppercase text-2xl mb-3 leading-none">{f.title}</h3>
                  <p className="font-body text-sm font-medium leading-relaxed">{f.description}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-6 pt-4 border-t-[3px] border-black flex items-center gap-1.5 font-mono-nb text-xs font-bold uppercase focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#3B3BFF]"
                >
                  Try in studio
                  <ArrowUpRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </Link>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Sticky stacking cards: each card pins and the next one slides over it. */
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-[#3B3BFF] scroll-mt-20 border-b-[3px] border-black relative"
    >
      <div
        className="absolute inset-0 nb-dots opacity-[0.15] pointer-events-none"
        style={{ filter: "invert(1)" }}
        aria-hidden="true"
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 text-white">
          <Tag bg={C.yellow} className="text-black">
            Workflow // Three steps
          </Tag>
          <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-6 leading-[0.95]">
            <RevealText inView text="From thought to publication in seconds." />
          </h2>
          <p className="font-body mt-6 text-lg font-medium text-white/90">
            Eliminate writer&apos;s block with structured inputs designed to extract high-signal answers
            from the AI.
          </p>
        </div>

        <ol className="relative list-none">
          {STEPS.map((s, i) => (
            <li key={i} className="sticky mb-10" style={{ top: `calc(6rem + ${i * 1.75}rem)` }}>
              <m.div
                initial={{ opacity: 0, y: 60, rotate: s.rotate * 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: EASE }}
                className={`${BORDER} ${SHADOW_LG} p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 min-h-[240px]`}
                style={{ background: s.bg }}
              >
                <div
                  aria-hidden="true"
                  className="font-display text-7xl sm:text-9xl leading-none shrink-0"
                  style={{ WebkitTextStroke: "3px #000", color: "#fff" }}
                >
                  {s.step}
                </div>
                <div>
                  <h3 className="font-display uppercase text-3xl sm:text-5xl leading-none mb-4">
                    <span className="sr-only">Step {s.step}: </span>
                    {s.title}
                  </h3>
                  <p className="font-body text-base sm:text-lg font-medium leading-snug max-w-xl">{s.desc}</p>
                </div>
              </m.div>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <NBButton href="/dashboard" bg={C.yellow}>
            <span>Try The Workflow Now</span>
            <ArrowRight className="w-5 h-5" />
          </NBButton>
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({
  uc,
  i,
  className = "",
}: {
  uc: UseCase;
  i: number;
  className?: string;
}) {
  return (
    <article
      className={`${BORDER} ${SHADOW_LG} flex flex-col sm:flex-row ${className}`}
      style={{ background: uc.bg }}
    >
      <div className="relative h-44 sm:h-auto sm:min-h-[16rem] sm:w-1/2 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black overflow-hidden bg-black">
        <Image
          src={uc.image}
          alt={uc.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 48vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 font-mono-nb text-[10px] font-bold bg-white border-2 border-black px-2 py-1">
          {uc.tag}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-3 font-display text-6xl text-white"
          style={{ WebkitTextStroke: "2px #000" }}
        >
          0{i + 1}
        </span>
      </div>
      <div className="p-5 sm:p-8 sm:w-1/2 flex flex-col justify-center">
        <h3 className="font-display uppercase text-2xl sm:text-4xl leading-none mb-4">{uc.title}</h3>
        <p className="font-body text-sm sm:text-base font-medium leading-snug">{uc.description}</p>
      </div>
    </article>
  );
}

function UseCasesHeader() {
  return (
    <div className="px-4 sm:px-10 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <Tag bg={C.green}>Applications // Use cases</Tag>
        <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-4 leading-[0.95]">
          Every format.
          <br />
          Every audience.
        </h2>
      </div>
      <p className="font-body text-base sm:text-lg font-medium max-w-sm">
        Engineered for modern digital publishing — from individual blogs to multi-channel marketing
        campaigns.
      </p>
    </div>
  );
}

/**
 * Desktop: pinned section converting vertical scroll into horizontal movement.
 * The travel distance and section height are measured, not hard-coded.
 * Mobile: a plain vertical stack (pinned horizontal scroll is awkward on touch).
 */
function UseCases() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const distMV = useMotionValue(0);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      distMV.set(d);
      setDist(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [distMV]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const x = useTransform([smooth, distMV], ([p, d]: number[]) => -p * d);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section id="use-cases" className="bg-[#FFF4E0] scroll-mt-20 border-b-[3px] border-black">
      {/* mobile / tablet */}
      <div className="md:hidden py-20">
        <UseCasesHeader />
        <div className="px-4 space-y-8">
          {USE_CASES.map((uc, i) => (
            <UseCaseCard key={i} uc={uc} i={i} />
          ))}
        </div>
      </div>

      {/* desktop pinned horizontal scroll */}
      <div
        ref={ref}
        className="relative hidden md:block"
        style={{ height: dist ? `calc(100dvh + ${dist}px)` : "300vh" }}
      >
        <div className="sticky top-0 h-dvh overflow-hidden flex flex-col justify-center">
          <UseCasesHeader />
          <m.div
            ref={trackRef}
            style={{ x, willChange: "transform" }}
            className="flex gap-[3vw] pl-[5vw] pr-[5vw] w-max"
          >
            {USE_CASES.map((uc, i) => (
              <UseCaseCard key={i} uc={uc} i={i} className="w-[60vw] lg:w-[48vw] shrink-0" />
            ))}
          </m.div>

          <div
            className="mx-4 sm:mx-10 mt-8 sm:mt-10 h-5 bg-white border-[3px] border-black"
            role="presentation"
          >
            <m.div style={{ width: bar, background: C.pink }} className="h-full border-r-[3px] border-black" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* tiny syntax-highlight helpers for the code card */
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#FF6AD5]">{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#00E676]">{children}</span>
);
const F = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#FFE500]">{children}</span>
);

const codeContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const codeLine: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

function Developers() {
  const lines = [
    <span key="l1">
      <K>import</K> {`{ GoogleGenerativeAI }`} <K>from</K> <S>&quot;@google/generative-ai&quot;</S>;
    </span>,
    <span key="l2" className="text-white/60">{`// Gemini Flash client with high-throughput streaming`}</span>,
    <span key="l3">
      <K>const</K> genAI = <K>new</K> <F>GoogleGenerativeAI</F>(process.env.GEMINI_API_KEY!);
    </span>,
    <span key="l4">
      <K>const</K> model = genAI.<F>getGenerativeModel</F>({`{ model: `}
      <S>&quot;gemini-2.0-flash&quot;</S>
      {` }`});
    </span>,
    <span key="l5">
      <K>export async function</K> <F>POST</F>(req: Request) {`{`}
    </span>,
    <span key="l6" className="pl-6 inline-block">
      <K>const</K> {`{ prompt }`} = <K>await</K> req.<F>json</F>();
    </span>,
    <span key="l7" className="pl-6 inline-block">
      <K>const</K> {`{ stream }`} = <K>await</K> model.<F>generateContentStream</F>(prompt);
    </span>,
    <span key="l8" className="pl-6 inline-block">
      <K>return new</K> Response(<F>toReadableStream</F>(stream));
    </span>,
    <span key="l9">{`}`}</span>,
  ];

  return (
    <section id="developers" className="py-20 sm:py-28 bg-[#FF6AD5] scroll-mt-20 border-b-[3px] border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <Tag bg="#fff">Engineering // Architecture</Tag>
          <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-6 leading-[0.95]">
            <RevealText inView text="Built on Next.js 15 & Gemini" />
          </h2>
          <p className="font-body mt-6 text-lg font-medium">
            An open, modular architecture built with TypeScript, Neon Serverless PostgreSQL, Drizzle ORM,
            and Google Gemini.
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 60, rotate: 1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className={`max-w-4xl mx-auto mb-16 bg-black ${BORDER} ${SHADOW_LG}`}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b-[3px] border-black"
            style={{ background: C.yellow }}
          >
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border-2 border-black" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border-2 border-black" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border-2 border-black" />
              <span className="font-mono-nb text-xs font-bold ml-2">app/api/generate/route.ts</span>
            </div>
            <span className="hidden sm:block font-mono-nb text-[10px] font-bold uppercase">TypeScript</span>
          </div>
          <m.div
            variants={codeContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="p-5 font-mono-nb text-xs sm:text-sm text-white/90 overflow-x-auto space-y-1.5"
          >
            {lines.map((l, i) => (
              <m.p key={i} variants={codeLine} className="whitespace-nowrap">
                {l}
              </m.p>
            ))}
          </m.div>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {DEVELOPERS.map((d, i) => (
            <m.div
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
              className={`bg-white ${BORDER} ${SHADOW_LG} p-6 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="relative w-20 h-20 shrink-0 overflow-hidden border-[3px] border-black"
                  style={{ background: d.bg }}
                >
                  <Image src={d.image} alt={d.name} fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <h3 className="font-display uppercase text-xl leading-none">{d.name}</h3>
                  <p
                    className="font-mono-nb text-[11px] font-bold uppercase mt-1.5 px-2 py-0.5 inline-block border-2 border-black"
                    style={{ background: d.bg }}
                  >
                    {d.role}
                  </p>
                </div>
              </div>
              <p className="font-body text-sm font-medium leading-relaxed mb-6">{d.bio}</p>
              <div className="flex items-center gap-3 pt-4 border-t-[3px] border-black">
                <NBButton href={d.github} external bg="#fff" className="!px-4 !py-2 !text-[11px] !shadow-[4px_4px_0_0_#000]">
                  GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only"> profile of {d.name}</span>
                </NBButton>
                <NBButton href={d.linkedin} external bg={C.yellow} className="!px-4 !py-2 !text-[11px] !shadow-[4px_4px_0_0_#000]">
                  LinkedIn <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only"> profile of {d.name}</span>
                </NBButton>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#FFF4E0] scroll-mt-20 border-b-[3px] border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <Tag bg={C.yellow}>Pricing // Transparent tiers</Tag>
          <h2 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl mt-6 leading-[0.95]">
            <RevealText inView text="Simple plans for serious creators." />
          </h2>
          <p className="font-body mt-6 text-lg font-medium">
            Start with 300,000 free monthly words. Upgrade whenever you need unlimited generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p, i) => (
            <m.div
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -8 }}
              // Featured offset uses margin: a Tailwind translate class would be overridden by framer's inline transform.
              className={`relative flex flex-col justify-between p-8 ${BORDER} ${
                p.featured ? "shadow-[12px_12px_0_0_#000] md:-mt-4" : SHADOW_LG
              }`}
              style={{ background: p.bg }}
            >
              {p.featured && (
                <m.span
                  animate={{ rotate: [-6, 6, -6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute -top-5 -right-4 font-mono-nb text-xs font-bold uppercase px-3 py-1.5 ${BORDER} shadow-[3px_3px_0_0_#000]`}
                  style={{ background: C.pink }}
                >
                  ★ Popular
                </m.span>
              )}
              <div>
                <span className="inline-block font-mono-nb text-xs font-bold uppercase bg-black text-white px-2 py-1 mb-4">
                  {"// "}
                  {p.tag}
                </span>
                <h3 className="font-display uppercase text-3xl mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-6xl leading-none">{p.price}</span>
                  <span className="font-mono-nb text-xs font-bold">{p.period}</span>
                </div>
                <ul className="space-y-3 pt-5 border-t-[3px] border-black">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 font-body text-sm font-bold">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 w-5 h-5 border-2 border-black flex items-center justify-center"
                        style={{ background: C.green }}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={4} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <NBButton href={p.href} bg={p.featured ? C.blue : C.black} color="#fff" className="w-full">
                  {p.cta}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </NBButton>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const k = reduce ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rot = useTransform(scrollYProgress, [0, 1], [-14 * k, 14 * k]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [0.7, 1.1, 0.8]);
  const rot2 = useTransform(scrollYProgress, [0, 1], [10 * k, -20 * k]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#00E676] py-24 sm:py-32 border-b-[3px] border-black">
      <div className="absolute inset-0 nb-dots opacity-[0.12] pointer-events-none" aria-hidden="true" />
      <m.div
        aria-hidden="true"
        style={{ rotate: rot, scale, background: C.yellow }}
        className={`hidden md:flex absolute right-[6%] top-12 w-32 h-32 ${BORDER} ${SHADOW} items-center justify-center`}
      >
        <Sparkles className="w-14 h-14" />
      </m.div>
      <m.div
        aria-hidden="true"
        style={{ rotate: rot2, background: C.pink }}
        className={`hidden md:block absolute left-[5%] bottom-12 w-24 h-24 rounded-full ${BORDER} ${SHADOW}`}
      />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <Tag bg="#fff">Start creating today</Tag>
        <h2 className="font-display uppercase text-5xl sm:text-7xl md:text-8xl mt-8 leading-[0.92]">
          <RevealText inView text="Ready to unleash AI content?" />
        </h2>
        <p className="font-body mt-6 text-lg sm:text-xl font-bold max-w-xl mx-auto">
          Join thousands of creators using Astragen to produce original, high-converting content in seconds.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
          <NBButton href="/dashboard" bg={C.black} color="#fff" className="w-full sm:w-auto">
            Launch Astragen Studio
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </NBButton>
          <NBButton href="/contact" bg="#fff" className="w-full sm:w-auto">
            Contact Support
          </NBButton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    // LazyMotion + `m` keeps framer-motion's initial bundle small; reducedMotion="user"
    // disables transform animations for people who ask the OS for less motion.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="font-body min-h-screen bg-[#FFF4E0] text-black overflow-x-clip">
          <SmoothScroll />
          <ScrollProgress />
          <LandingNavbar />

          <main>
            <Hero />

            <VelocityMarquee
              bg={C.pink}
              baseVelocity={-3}
              rotate={-1}
              items={["Blog Posts", "Ad Copy", "YouTube Scripts", "SEO Meta", "Code Synthesis"]}
            />

            <Testimonials />

            <VelocityMarquee
              bg={C.green}
              baseVelocity={3}
              rotate={1}
              items={["Gemini 2.0", "Stream Fast", "Export Clean", "50+ Engines", "Ship Daily"]}
            />

            <Features />
            <HowItWorks />
            <UseCases />
            <Developers />
            <Pricing />
            <FinalCTA />
          </main>

          <Footer />

          {/* Floating support button */}
          <m.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
            className="fixed right-6 z-40"
            style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <Link
              href="/contact"
              aria-label="Contact support"
              className={`flex items-center justify-center w-14 h-14 ${BORDER} ${SHADOW} hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_#000] active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#3B3BFF] transition-[transform,box-shadow]`}
              style={{ background: C.yellow }}
            >
              <MessageSquare className="w-6 h-6" aria-hidden="true" />
            </Link>
          </m.div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}