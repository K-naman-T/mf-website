import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { IntroDoneProvider } from "@/components/motion/core/IntroDoneContext";
import { OOPositionProvider } from "@/components/motion/core/OOPositionContext";
import { getHomeContent } from "@/lib/cms/loader";
import { getOrganizationJsonLd, getRootMetadata, getWebsiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = getRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = getHomeContent();
  const jsonLd = [getOrganizationJsonLd(), getWebsiteJsonLd()];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider>
          <IntroDoneProvider>
            <OOPositionProvider>
              <Navbar content={content.navigation} />
              {children}
              <CookieNotice />
            </OOPositionProvider>
          </IntroDoneProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
