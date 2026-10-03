import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "katex/dist/katex.min.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevPath RO — Învață IT & AI",
    template: "%s — DevPath RO",
  },
  description:
    "Platformă de învățare IT/AI pentru studenți români. Cursuri interactive, AI Coach, și portofoliu automat.",
  keywords: ["IT", "AI", "programare", "cursuri online", "Romania", "invatare", "machine learning"],
  authors: [{ name: "DevPath RO" }],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    siteName: "DevPath RO",
    title: "DevPath RO — Învață IT & AI",
    description:
      "Platformă de învățare IT/AI pentru studenți români. Cursuri interactive, AI Coach, și portofoliu automat.",
    images: [
      {
        url: "/og?title=DevPath%20RO&description=Platforma%20de%20invatare%20IT%20%26%20AI%20pentru%20studenti%20romani.",
        width: 1200,
        height: 630,
        alt: "DevPath RO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPath RO — Învață IT & AI",
    description:
      "Platformă de învățare IT/AI pentru studenți români. Cursuri interactive, AI Coach, și portofoliu automat.",
    images: ["/og?title=DevPath%20RO&description=Platforma%20de%20invatare%20IT%20%26%20AI%20pentru%20studenti%20romani."],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
