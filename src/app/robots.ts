import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sml.boutique";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop/", "/shop?category=", "/shop?brand="],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/wishlist",
          "/cart",
          "/checkout",
          "/account",
          "/*?action=",       // WooCommerce plugin actions
          "/*?add-to-cart=",
          "/shop?",           // filtered/query param shop pages (except those allowed above)
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
