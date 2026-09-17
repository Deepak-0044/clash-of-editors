import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://clash-of-editors.vercel.app";

const ogImage =
  "https://res.cloudinary.com/rf9d62ct/image/upload/f_auto,q_auto/coe";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Clash of Editors — Only the best will claim the throne",
    template: "%s | Clash of Editors",
  },

  description:
    "Clash of Editors is a professional anime and video editing championship. Register, submit your audition, and compete for a place among the Final 16.",

  keywords: [
    "anime editing competition",
    "video editing championship",
    "AMV competition",
    "editing tournament",
    "clash of editors",
  ],

  applicationName: "Clash of Editors",

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Clash of Editors",
    title: "Clash of Editors — Only the best will claim the throne",
    description:
      "A professional anime and video editing championship. Four leaders. Sixteen editors. One throne.",

    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Clash of Editors",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Clash of Editors — Only the best will claim the throne",
    description:
      "A professional anime and video editing championship. Four leaders. Sixteen editors. One throne.",

    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#04060c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen bg-ink text-white antialiased">
        {children}
      </body>
    </html>
  );
}