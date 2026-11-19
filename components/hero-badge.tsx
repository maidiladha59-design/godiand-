import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon, type IconName } from "./icons";

const ringText =
  "TARIF JELAS • BAYAR DI TEMPAT • GODIAND • DRIVER LOKAL •";

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
    position: "left-[1%] top-[4%]",
    tone: "bg-sun-400 text-ink-900",
    tilt: "-rotate-[4deg]",
    iconClass: "fill-current",
    distance: "-7px",
    duration: "4.8s",
    delay: "-0.4s",
  },
  {
    label: "Tunai / QRIS",
    icon: "wallet",
    position: "right-[1%] top-[11%]",
    tone: "bg-coral-600 text-white",
    tilt: "rotate-3",
    distance: "-9px",
    duration: "6.1s",
    delay: "-2.2s",
  },
  {
    label: "6 layanan",
    icon: "sparkles",
    position: "left-[2%] bottom-[8%]",
    tone: "bg-mint-600 text-white",
    tilt: "rotate-2",
    distance: "-8px",
    duration: "5.5s",
    delay: "-3.1s",
  },
  {
    label: "Ada tombol SOS",
    icon: "shield",
    position: "right-[1%] bottom-[4%]",
    tone: "bg-white text-ink-900",
    tilt: "-rotate-3",
    iconClass: "text-coral-600",
    distance: "-10px",
    duration: "6.8s",
    delay: "-1.2s",
  },
];

export function HeroBadge() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[24rem] sm:max-w-[27rem] lg:max-w-[30rem]">
      <div className="absolute inset-0 grid scale-[1.18] place-items-center sm:scale-100">
        <div className="gd-badge relative aspect-square w-[96%] rounded-full border-[5px] border-ink-900 bg-white shadow-[0_10px_0_#0b1c26]">
          <div
            aria-hidden="true"
            className="absolute inset-[16%] rounded-full border-4 border-ink-900 bg-sun-400 shadow-[inset_0_-6px_0_rgba(11,28,38,0.16)]"
          />

          <div
            aria-hidden="true"
            className="gd-badge-ring pointer-events-none absolute inset-0"
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <defs>
                <path
                  id="gd-badge-text-path"
                  d="M200 200m-158 0a158 158 0 1 1 316 0a158 158 0 1 1-316 0"
                />
              </defs>
              <text
                fill="#0b1c26"
                fontSize="20"
                fontWeight="900"
                letterSpacing="1.2"
              >
                <textPath
                  href="#gd-badge-text-path"
                  startOffset="0"
                  textLength="960"
                  lengthAdjust="spacing"
                >
                  {ringText}
                </textPath>
              </text>
            </svg>
          </div>

          <div className="absolute inset-0 grid place-items-center">
            <div className="gd-badge-logo w-[48%] drop-shadow-[0_5px_0_#0b1c26]">
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
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border-2 border-ink-900 px-3.5 py-2.5 text-[13px] font-extrabold shadow-[3px_3px_0_#0b1c26] sm:text-sm ${chip.tone} ${chip.tilt}`}
            >
              <Icon
                name={chip.icon}
                size={17}
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
