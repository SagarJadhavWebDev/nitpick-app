import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bugsnapr — Bug Reporting for Small Teams",
  description: "Capture a bug with screenshots, console errors, and page context — sent straight to Slack. No login required for reporters.",
  metadataBase: new URL("https://bugsnapr.com"),
  keywords: [
    "bug reporting",
    "slack integration",
    "developer tools",
    "chrome extension bug report",
    "bugsnapr",
    "small teams",
    "issue tracker"
  ],
  openGraph: {
    title: "Bugsnapr — Bug Reporting for Small Teams",
    description: "Capture a bug with screenshots, console errors, and page context — sent straight to Slack. No login required for reporters.",
    url: "https://bugsnapr.com",
    siteName: "Bugsnapr",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Bugsnapr - Bug reporting straight to Slack",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bugsnapr — Bug Reporting for Small Teams",
    description: "Capture a bug with screenshots, console errors, and page context — sent straight to Slack.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#EDEFF2] text-[#14171F] font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}

