import { statSync } from "node:fs";
import path from "node:path";

export const apkHref = "/godiand.apk";
export const apkFileName = "godiand.apk";

const apkBytes = statSync(
  path.join(process.cwd(), "public", apkFileName),
).size;

export const apkSizeLabel = `${(apkBytes / (1024 * 1024))
  .toFixed(1)
  .replace(".", ",")} MB`;
