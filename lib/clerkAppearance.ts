export const clerkAppearance = {
  variables: {
    colorPrimary: "#A855F7",
    colorBackground: "#151515",
    colorText: "#FFFFFF",
    colorInputBackground: "#1A1A1A",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-poppins), sans-serif",
  },
  elements: {
    card: "border border-border shadow-xl rounded-2xl bg-surface text-ink p-6 sm:p-8 backdrop-blur-sm",
    formButtonPrimary:
      "bg-action text-action-ink hover:bg-action-hover rounded-full font-medium text-sm transition-all duration-150 active:scale-[0.98]",
    formFieldInput:
      "border border-border rounded-lg font-sans text-sm text-ink bg-surface-elevated focus:border-action focus:ring-2 focus:ring-action/20 transition-all",
    footerActionLink: "text-action font-medium hover:underline underline-offset-4",
    socialButtonsBlockButton:
      "border border-border rounded-full shadow-sm text-xs font-medium text-ink bg-surface hover:bg-surface-elevated transition-all",
    headerTitle: "font-sans font-semibold text-xl tracking-tight text-ink",
    headerSubtitle: "font-sans text-xs text-ink-muted mt-1",
    identityPreviewText: "font-medium text-ink",
    dividerLine: "bg-border h-[1px]",
    dividerText: "font-sans text-xs uppercase text-ink-muted bg-surface px-3",
  },
};
