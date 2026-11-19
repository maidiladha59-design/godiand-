import Image from "next/image";

type LogoProps = {
  tone?: "dark" | "light";
  className?: string;
  preload?: boolean;
};

export function Logo({
  tone = "dark",
  className = "",
  preload = false,
}: LogoProps) {
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
