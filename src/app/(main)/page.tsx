import type { Metadata } from "next";
import { HomePage } from "@/features/home";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "SML Informatique — Votre spécialiste en vente et maintenance de matériel informatique & bureautique en Tunisie. Livraison rapide partout en Tunisie.",
  keywords: [
    "informatique tunisie",
    "vente ordinateur tunisie",
    "laptop tunisie prix",
    "SML informatique",
    "matériel informatique tunisie",
    "maintenance pc tunisie",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "SML Informatique | Vente Matériel Informatique Tunisie",
    description:
      "Votre spécialiste en vente et maintenance de matériel informatique & bureautique en Tunisie.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SML Informatique",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SML Informatique | Vente Matériel Informatique Tunisie",
    description:
      "Votre spécialiste en vente et maintenance de matériel informatique & bureautique en Tunisie.",
    images: [{ url: `${SITE_URL}/og-image.png`, alt: "SML Informatique" }],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SML Informatique",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Vente et maintenance de matériel informatique & bureautique en Tunisie.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "TN",
  },
  inLanguage: "fr-TN",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SML Informatique",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomePage />
    </main>
  );
}
