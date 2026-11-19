import type { ReactNode } from "react";

export type IconName =
  | "pin"
  | "arrow-right"
  | "arrow-down"
  | "download"
  | "smartphone"
  | "play"
  | "menu"
  | "close"
  | "bike"
  | "package"
  | "utensils"
  | "washer"
  | "bag"
  | "store"
  | "receipt"
  | "wallet"
  | "shield"
  | "chat"
  | "check"
  | "sparkles"
  | "instagram"
  | "whatsapp"
  | "qr"
  | "grid"
  | "route"
  | "clock"
  | "star"
  | "chevron-right"
  | "user"
  | "alert";

const shapes: Record<IconName, ReactNode> = {
  pin: (
    <>
      <path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  "arrow-down": (
    <>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  smartphone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5-12-7.5Z" />,
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="17" r="3.5" />
      <circle cx="18.5" cy="17" r="3.5" />
      <path d="M5.5 17 9.8 9.5h4.6l4.1 7.5" />
      <path d="M8.4 9.5h4.4" />
      <path d="M14.2 6.5h2.5l1.8 3" />
    </>
  ),
  package: (
    <>
      <path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
      <path d="m7.5 4.3 9 5.2" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v6a2 2 0 0 0 4 0V3" />
      <path d="M9 11v10" />
      <path d="M17 3c-2 1.5-3 3.5-3 6 0 1.8 1 3 3 3" />
      <path d="M17 12v9" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <circle cx="12" cy="14" r="4.5" />
      <path d="M8 7h.01" />
      <path d="M11 7h2" />
      <path d="M10.2 12.5c.7 1 2.9 1 3.6 0" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8h13l1 12.5h-15L5.5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  store: (
    <>
      <path d="M4 10.5V20h16v-9.5" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M3 10c0 1.5 1.4 2.5 3 2.5s3-1 3-2.5c0 1.5 1.4 2.5 3 2.5s3-1 3-2.5c0 1.5 1.4 2.5 3 2.5s3-1 3-2.5" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="15" r="1" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3Z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7" />
      <path d="M8.5 14h4" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-10" />,
  sparkles: (
    <>
      <path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20l1.2-4.3A8.5 8.5 0 1 1 20.5 11.6Z" />
      <path d="M8.9 8.4c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.7 1.7c.1.3 0 .5-.1.7l-.6.6c.6 1.2 1.5 2.1 2.7 2.7l.6-.6c.2-.2.4-.3.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .5-.4.7-.6.3-1.4.4-2.2.2-2.7-.7-4.8-2.8-5.5-5.5-.2-.8-.1-1.6.2-2.2Z" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3" />
      <path d="M20 20h-3" />
      <path d="M20 14v2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h7a3 3 0 0 0 0-6h-6a3 3 0 0 1 0-6h7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: (
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
  ),
  "chevron-right": <path d="m9 5 7 7-7 7" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 21 20H3L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.01" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  name,
  size = 24,
  strokeWidth = 2.2,
  className,
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {shapes[name]}
    </svg>
  );
}
