import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { IntroDoneProvider } from "@/components/motion/core/IntroDoneContext";
import { OOPositionProvider } from "@/components/motion/core/OOPositionContext";
import { getHomeContent } from "@/lib/cms/loader";

export const metadata: Metadata = {
  title: "METAFLOOR — Sovereign AI Foundry",
  description:
    "Deterministic production systems. AI that actually ships.",
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
  const content = getHomeContent();

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
        <ThemeProvider>
          <IntroDoneProvider>
            <OOPositionProvider>
              <Navbar content={content.navigation} />
              {children}
            </OOPositionProvider>
          </IntroDoneProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
