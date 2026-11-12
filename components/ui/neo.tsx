"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/* NEOBRUTALISM DESIGN TOKENS                                         */
/* ------------------------------------------------------------------ */
export const C = {
  cream: "#FFF4E0",
  yellow: "#FFE500",
  pink: "#FF6AD5",
  blue: "#3B3BFF",
  green: "#00E676",
  orange: "#FF5C00",
  sky: "#7DD3FC",
  lavender: "#C4B5FD",
  black: "#000000",
  white: "#FFFFFF",
  slateBg: "#0A0B14",
  slateSurface: "#121324",
};

export const BORDER = "border-[3px] border-black dark:border-white";
export const BORDER_2 = "border-2 border-black dark:border-white";
export const SHADOW = "shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]";
export const SHADOW_SM = "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]";
export const SHADOW_LG = "shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_#fff]";

export const PRESS_BASE =
  "border-[3px] border-black dark:border-white font-mono-nb font-bold uppercase tracking-wide transition-all duration-150 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:outline-none";

export const PRESS = `${PRESS_BASE} text-sm px-6 py-3 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_#000] dark:hover:shadow-[3px_3px_0_0_#fff]`;
export const PRESS_SM = `${PRESS_BASE} text-xs px-3 py-1.5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]`;

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
  }),
};

/* ------------------------------------------------------------------ */
/* REUSABLE NEOBRUTALIST COMPONENTS                                   */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "brand" | "dark" | "light" | "danger" | "success";

interface PressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  external?: boolean;
  loading?: boolean;
}

export function PressButton({
  href,
  variant = "primary",
  size = "md",
  external = false,
  loading = false,
  children,
  className = "",
  disabled,
  onClick,
  ...rest
}: PressButtonProps) {
  let variantStyles = "bg-[#FFE500] text-black hover:bg-[#FFD600]";
  if (variant === "brand") variantStyles = "bg-[#3B3BFF] text-white hover:bg-[#2A2AEB]";
  else if (variant === "dark") variantStyles = "bg-black text-white hover:bg-neutral-900";
  else if (variant === "light") variantStyles = "bg-white text-black hover:bg-neutral-100";
  else if (variant === "danger") variantStyles = "bg-[#FF5C00] text-white hover:bg-[#E05200]";
  else if (variant === "success") variantStyles = "bg-[#00E676] text-black hover:bg-[#00D06A]";

  const sizeStyles =
    size === "sm"
      ? "text-xs px-3 py-1.5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
      : size === "lg"
      ? "text-base px-8 py-4 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff]"
      : "text-sm px-6 py-3 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_#000] dark:hover:shadow-[3px_3px_0_0_#fff]";

  const disabledStyles = disabled || loading ? "opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]" : "";

  const cls = `inline-flex items-center justify-center gap-2 ${PRESS_BASE} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`;

  if (href && !disabled) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {loading && <Sparkles className="w-4 h-4 animate-spin-slow" />}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {loading && <Sparkles className="w-4 h-4 animate-spin-slow" />}
        {children}
      </Link>
    );
  }

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={onClick}
      className={cls}
    >
      {loading && <Sparkles className="w-4 h-4 animate-spin-slow" />}
      {children}
    </button>
  );
}

export function Tag({
  children,
  bg = "#FFE500",
  color = "#000000",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block font-mono-nb text-xs font-bold uppercase tracking-widest px-3 py-1 ${BORDER} shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

export function NeoCard({
  children,
  className = "",
  style,
  bg = "#FFFFFF",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bg?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#121324] ${BORDER} ${SHADOW} p-6 text-black dark:text-white ${className}`}
      style={{ background: bg ? undefined : undefined, ...style }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  tag,
  title,
  highlightWord,
  highlightBg = C.yellow,
  highlightRotate = -1.5,
  subtitle,
  actions,
}: {
  tag: string;
  title: string;
  highlightWord?: string;
  highlightBg?: string;
  highlightRotate?: number;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <Tag bg={C.yellow}>{tag}</Tag>
        <h1 className="font-display uppercase text-3xl sm:text-5xl md:text-6xl mt-4 leading-[0.95] text-black dark:text-white flex flex-wrap items-center gap-2">
          <span>{title}</span>
          {highlightWord && (
            <span
              className={`inline-block px-3 py-1 text-black ${BORDER} shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]`}
              style={{ background: highlightBg, transform: `rotate(${highlightRotate}deg)` }}
            >
              {highlightWord}
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="font-body mt-3 text-base sm:text-lg font-medium text-black/80 dark:text-neutral-300 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}) {
  return (
    <div className={`p-12 text-center border-[3px] border-dashed border-black dark:border-white bg-[#FFF4E0] dark:bg-[#121324] ${SHADOW} my-8`}>
      <div className={`w-14 h-14 mx-auto mb-4 bg-[#FFE500] text-black ${BORDER} shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex items-center justify-center -rotate-3`}>
        <Icon className="w-7 h-7" strokeWidth={2.5} />
      </div>
      <h3 className="font-display uppercase text-2xl md:text-3xl text-black dark:text-white mb-2">
        {title}
      </h3>
      <p className="font-body text-sm md:text-base font-medium text-black/70 dark:text-neutral-300 max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionLabel && (actionHref || onAction) && (
        <PressButton href={actionHref} onClick={onAction} variant="primary">
          {actionLabel}
        </PressButton>
      )}
    </div>
  );
}

export function StreamingCursor() {
  return (
    <span className="inline-block w-2.5 h-5 bg-[#FFE500] border-2 border-black dark:border-white align-middle ml-1 animate-pulse" />
  );
}

export function RevealText({
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
  const anim = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
    : { animate: "show" };
  return (
    <motion.span
      initial="hidden"
      {...anim}
      className={`inline-block ${className}`}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%", rotate: 4 },
              show: {
                y: "0%",
                rotate: 0,
                transition: { duration: 0.8, ease: EASE, delay: delay + i * 0.07 },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
