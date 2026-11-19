const siteUrl = (
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://godiand.example"
).replace(/\/+$/, "");

export const legalLinks = {
  terms: `${siteUrl}/syarat`,
  privacy: `${siteUrl}/privasi`,
} as const;
