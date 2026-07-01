import type { Platform } from "./types";

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M15 8.5h2V5.2h-2.3C12.1 5.2 11 6.6 11 9v2.2H9V14h2v6h2.8v-6h2.2l.4-2.8h-2.6V9c0-.6.2-.5.6-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 5l14 14M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="9" r="0.9" fill="currentColor" />
      <path d="M8 11.5v5M12 11.5v5M12 13.5c0-1.4 1-2 2-2s2 .8 2 2v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TikTokMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 4v9.2a3 3 0 1 1-2.4-2.94"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 4c.4 2 1.9 3.4 4 3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const PLATFORM_MARK: Record<
  Platform,
  React.ComponentType<{ className?: string }>
> = {
  INSTAGRAM: InstagramMark,
  FACEBOOK: FacebookMark,
  TWITTER: XMark,
  LINKEDIN: LinkedInMark,
  TIKTOK: TikTokMark,
};
