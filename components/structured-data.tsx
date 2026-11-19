import { services } from "@/lib/content";
import { site } from "@/lib/site";

/** Data terstruktur untuk mesin pencari (statis, bukan input pengguna). */
export function StructuredData() {
  const organizationId = `${site.url}/#organisasi`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/logo.png`,
        description: site.description,
        areaServed: { "@type": "City", name: site.city },
        sameAs: [site.instagram],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#situs`,
        url: site.url,
        name: site.name,
        inLanguage: "id-ID",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ItemList",
        name: "Layanan GoDiand",
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            name: service.name,
            description: service.description,
            areaServed: { "@type": "City", name: site.city },
            provider: { "@id": organizationId },
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
