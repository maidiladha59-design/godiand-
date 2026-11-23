import { Icon } from "./icons";
import { APK_URL, apkFileName } from "@/lib/apk";

export function ApkDownloadButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      href={APK_URL}
      download={apkFileName}
      className={`gd-btn gd-btn-primary ${className}`}
    >
      <Icon name="download" size={17} />
      Unduh APK Android
    </a>
  );
}
