import Image from "next/image";

type LogoProps = {
  tone?: "dark" | "light";
  className?: string;
  preload?: boolean;
  variant?: "plain" | "capsule";
};

export function Logo({
  tone = "dark",
  className = "",
  preload = false,
  variant = "plain",
}: LogoProps) {
  if (variant === "capsule") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border-2 border-ink-900 bg-white py-1 pl-1.5 pr-3.5 shadow-[3px_3px_0_#0b1c26] ${className}`}
      >
        <Image
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          className="h-8 w-8 rounded-full"
          preload={preload}
        />
        <span className="text-[17px] font-extrabold tracking-tight text-ink-900">
          GoDiand
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt="GoDiand"
        width={72}
        height={72}
        className="h-9 w-9"
        preload={preload}
      />
      <span
        className={`text-xl font-extrabold tracking-tight ${
          tone === "light" ? "text-white" : "text-ink-900"
        }`}
      >
        GoDiand
      </span>
    </span>
  );
}
