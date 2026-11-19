import { Icon } from "./icons";
import { apkFileName, apkHref } from "@/lib/apk";

export function ApkDownloadButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={apkHref}
      download={apkFileName}
      className={`gd-btn gd-btn-primary ${className}`}
    >
      <Icon name="download" size={17} />
      Unduh APK Android
    </a>
  );
}
