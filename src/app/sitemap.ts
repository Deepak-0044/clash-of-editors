import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/how-it-works", priority: 0.8 },
    { path: "/leaders", priority: 0.7 },
    { path: "/editors", priority: 0.7 },
    { path: "/timeline", priority: 0.7 },
    { path: "/rules", priority: 0.7 },
    { path: "/register", priority: 0.9 },
    { path: "/results", priority: 0.6 },
    { path: "/contact", priority: 0.5 },
  ];

  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
