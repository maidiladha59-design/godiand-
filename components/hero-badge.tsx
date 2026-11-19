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
    position: "left-0 top-[2%]",
    tone: "bg-sun-400 text-ink-900",
    tilt: "-rotate-6",
    distance: "-7px",
    duration: "4.8s",
    delay: "-0.4s",
  },
  {
    label: "Tunai / QRIS",
    icon: "wallet",
    position: "right-0 top-[5%]",
    tone: "bg-[#ff9d45] text-ink-900",
    tilt: "rotate-5",
    distance: "-9px",
    duration: "6.1s",
    delay: "-2.2s",
  },
  {
    label: "6 layanan",
    icon: "sparkles",
    position: "left-[2%] bottom-[2%]",
    tone: "bg-mint-600 text-white",
    tilt: "rotate-4",
    distance: "-8px",
    duration: "5.5s",
    delay: "-3.1s",
  },
  {
    label: "Ada tombol SOS",
    icon: "shield",
    position: "right-0 bottom-[2%]",
    tone: "bg-white text-ink-900",
    tilt: "-rotate-5",
    iconClass: "text-coral-600",
    distance: "-10px",
    duration: "6.8s",
    delay: "-1.2s",
  },
];

export function HeroBadge() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[24rem] sm:max-w-[26rem]">
      <div className="absolute inset-0 grid place-items-center">
        <div className="gd-badge relative aspect-square w-[80%] rounded-full border-4 border-ink-900 bg-white shadow-gd-lg">
          <div
            aria-hidden="true"
            className="absolute inset-[18%] rounded-full border-[3px] border-ink-900 bg-sun-400"
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
                fontSize="17.5"
                fontWeight="800"
                letterSpacing="1.1"
              >
                <textPath
                  href="#gd-badge-text-path"
                  startOffset="0"
                  textLength="940"
                  lengthAdjust="spacing"
                >
                  {ringText}
                </textPath>
              </text>
            </svg>
          </div>

          <div className="absolute inset-0 grid place-items-center">
            <div className="gd-badge-logo w-[44%]">
              <Image
                src="/logo.png"
                alt="Godiand"
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
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-ink-900 px-3 py-2 text-[12px] font-extrabold shadow-gd sm:text-[13px] ${chip.tone} ${chip.tilt}`}
            >
              <Icon
                name={chip.icon}
                size={16}
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
