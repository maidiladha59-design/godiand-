import Image from "next/image";

const outline = "#0B2536";

type LogoProps = {
  size?: number;
  variant?: "lingkaran" | "dengan-nama";
  mark?: "pelanggan" | "driver";
  tone?: "dark" | "light";
  preload?: boolean;
  fluid?: boolean;
  className?: string;
};

export function Logo({
  size = 40,
  variant = "lingkaran",
  mark = "pelanggan",
  tone = "dark",
  preload = false,
  fluid = false,
  className = "",
}: LogoProps) {
  const border = Math.max(2, Math.round(size * 0.06));
  const shadow = Math.max(1, Math.round(size * 0.06));
  const src = mark === "driver" ? "/logo-driver.png" : "/logo.png";
  const withName = variant === "dengan-nama";

  if (fluid) {
    return (
      <span
        className={`relative inline-block aspect-square w-full ${className}`}
        style={{ containerType: "inline-size" }}
      >
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            top: "6cqw",
            left: "6cqw",
            width: "100%",
            height: "100%",
            background: outline,
          }}
        />
        <span
          className="relative block h-full w-full overflow-hidden rounded-full bg-white"
          style={{ border: `6cqw solid ${outline}` }}
        >
          <Image
            src={src}
            alt="GoDiand"
            width={512}
            height={512}
            preload={preload}
            className="h-full w-full rounded-full object-cover"
            style={{ transform: "scale(1.08)" }}
          />
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={withName ? { gap: Math.max(6, Math.round(size * 0.2)) } : undefined}
    >
      <span
        className="relative inline-block shrink-0"
        style={{ width: size, height: size }}
      >
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            top: shadow,
            left: shadow,
            width: size,
            height: size,
            background: outline,
          }}
        />
        <span
          className="relative block overflow-hidden rounded-full bg-white"
          style={{
            width: size,
            height: size,
            border: `${border}px solid ${outline}`,
          }}
        >
          <Image
            src={src}
            alt={withName ? "" : "GoDiand"}
            width={512}
            height={512}
            preload={preload}
            className="h-full w-full rounded-full object-cover"
            style={{ transform: "scale(1.08)" }}
          />
        </span>
      </span>
      {withName ? (
        <span
          className={`font-extrabold tracking-tight ${
            tone === "light" ? "text-white" : "text-ink-900"
          }`}
          style={{ fontSize: Math.round(size * 0.5), lineHeight: 1.1 }}
        >
          GoDiand
        </span>
      ) : null}
    </span>
  );
}
