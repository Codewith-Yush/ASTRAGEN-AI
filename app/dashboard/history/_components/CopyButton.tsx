"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  aiResponse: string;
  className?: string;
}

function CopyButton({ aiResponse, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      aria-label={isCopied ? "Text copied" : "Copy response"}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer
        ${
          isCopied
            ? "bg-surface-elevated text-accent-cyan border border-border"
            : "bg-surface-elevated text-ink-muted hover:text-ink border border-border hover:border-border-subtle"
        }
        ${className ?? ""}
      `}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-accent-cyan" strokeWidth={1.5} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-ink-dim" strokeWidth={1.5} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default React.memo(CopyButton);
