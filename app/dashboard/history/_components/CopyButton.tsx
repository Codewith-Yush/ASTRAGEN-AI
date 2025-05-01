"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

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
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      className={`
        flex items-center gap-2 
        text-primary hover:text-primary-dark 
        transition-all duration-200 
        hover:bg-gray-100 
        rounded-full px-3 py-1 
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 
        ${isCopied ? 'bg-green-100 text-green-700' : ''} 
        ${className}
      `}
      onClick={handleCopy}
      aria-label={isCopied ? 'Text copied' : 'Copy text to clipboard'}
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 animate-bounce" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

export default CopyButton;