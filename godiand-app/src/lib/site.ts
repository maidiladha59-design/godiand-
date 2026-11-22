const siteUrl = (
  process.env.EXPO_PUBLIC_SITE_URL ?? "https://godiand.example"
).replace(/\/+$/, "");

export const legalLinks = {
  terms: `${siteUrl}/syarat`,
  privacy: `${siteUrl}/privasi`,
} as const;

export const defaultWhatsAppMessage = "Halo GoDiand, saya mau tanya.";

export const support = {
  whatsappNumber: "6285834043432",
  whatsappDisplay: "0858-3404-3432",
  emergencyNumber: "112",
} as const;

export function whatsappLink(
  message: string = defaultWhatsAppMessage,
): string {
  return `https://wa.me/${support.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
