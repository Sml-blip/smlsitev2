import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ModalProvider from "@/providers/ModalProvider";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";
const SITE_NAME = "SML Informatique";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Vente Matériel Informatique Tunisie`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "SML Informatique — Vente et maintenance de matériel informatique & bureautique en Tunisie. Ordinateurs, laptops, imprimantes, accessoires et plus.",
  keywords: [
    "informatique tunisie",
    "matériel informatique tunisie",
    "vente ordinateur tunisie",
    "laptop tunisie",
    "SML informatique",
    "maintenance informatique",
    "bureautique tunisie",
    "imprimante tunisie",
    "accessoires informatique",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  applicationName: SITE_NAME,
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "default",
    capable: true,
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "fr_TN",
    url: SITE_URL,
    title: `${SITE_NAME} | Vente Matériel Informatique Tunisie`,
    description:
      "SML Informatique — Vente et maintenance de matériel informatique & bureautique en Tunisie.",
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
    site: "@smlinformatique",
    creator: "@smlinformatique",
    title: `${SITE_NAME} | Vente Matériel Informatique Tunisie`,
    description:
      "SML Informatique — Vente et maintenance de matériel informatique & bureautique en Tunisie.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SML Informatique",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("antialiased", outfit.className)}>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="edb6cf7e-e970-46b2-9cdd-fd95c54de64e"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
          {children}
          <ModalProvider />
        </ThemeProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
