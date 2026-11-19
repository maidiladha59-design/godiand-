import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon, type IconName } from "./icons";

const ringText =
  "DRIVER LOKAL • TARIF JELAS • BAYAR DI TEMPAT • GODIAND •";

type MotionStyle = CSSProperties & { "--bob"?: string };

type HeroChip = {
  label: string;
  icon: IconName;
  position: string;
  tone: string;
  tilt: string;
  iconClass?: string;
  distance: string;
  duration: string;
  delay: string;
};

const chips: HeroChip[] = [
  {
    label: "Mulai Rp9.000",
    icon: "star",
    position: "left-0 top-0",
    tone: "bg-sun-400 text-ink-900",
    tilt: "-rotate-[2deg]",
    iconClass: "fill-current",
    distance: "-6px",
    duration: "4.8s",
    delay: "-0.4s",
  },
  {
    label: "Tunai / QRIS",
    icon: "wallet",
    position: "right-0 top-0",
    tone: "bg-coral-600 text-white",
    tilt: "rotate-[2deg]",
    distance: "-6px",
    duration: "6.1s",
    delay: "-2.2s",
  },
  {
    label: "6 layanan",
    icon: "sparkles",
    position: "left-0 bottom-0",
    tone: "bg-mint-600 text-white",
    tilt: "rotate-[2deg]",
    distance: "-4px",
    duration: "5.5s",
    delay: "-3.1s",
  },
  {
    label: "Ada tombol SOS",
    icon: "shield",
    position: "right-0 bottom-0",
    tone: "bg-white text-ink-900",
    tilt: "-rotate-[2deg]",
    iconClass: "text-coral-600",
    distance: "-4px",
    duration: "6.8s",
    delay: "-1.2s",
  },
];

export function HeroBadge() {
  return (
    <div className="relative mx-auto aspect-square w-[clamp(280px,86vw,380px)]">
      <div className="gd-badge relative h-full w-full rounded-full border-[5px] border-ink-900 bg-white shadow-[0_8px_0_#0b1c26]">
        <div
          aria-hidden="true"
          className="absolute inset-[19%] rounded-full border-4 border-ink-900 bg-sun-400 shadow-[inset_0_-5px_0_rgba(11,28,38,0.16)]"
        />

        <div
          aria-hidden="true"
          className="gd-badge-ring pointer-events-none absolute inset-0"
        >
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <defs>
              <path
                id="gd-badge-text-path"
                d="M200 200m-140 0a140 140 0 1 1 280 0a140 140 0 1 1 -280 0"
              />
            </defs>
            <text
              fill="#0b1c26"
              fontSize="20"
              fontWeight="900"
              letterSpacing="0"
            >
              <textPath
                href="#gd-badge-text-path"
                startOffset="0"
                textLength="840"
                lengthAdjust="spacing"
              >
                {ringText}
              </textPath>
            </text>
          </svg>
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="gd-badge-logo w-[40%] drop-shadow-[0_4px_0_#0b1c26]">
            <Image
              src="/logo.png"
              alt="GoDiand"
              width={512}
              height={512}
              loading="eager"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>

      <ul aria-hidden="true">
        {chips.map((chip) => (
          <li
            key={chip.label}
            className={`gd-bob absolute z-10 ${chip.position}`}
            style={
              {
                animationDuration: chip.duration,
                animationDelay: chip.delay,
                "--bob": chip.distance,
              } as MotionStyle
            }
          >
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-ink-900 px-2 py-1 text-[13px] font-extrabold shadow-[2px_2px_0_#0b1c26] sm:text-[14px] ${chip.tone} ${chip.tilt}`}
            >
              <Icon
                name={chip.icon}
                size={15}
                strokeWidth={2.4}
                className={chip.iconClass}
              />
              {chip.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
