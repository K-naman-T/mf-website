import ManifestoPage from "@/components/manifesto/ManifestoPage";
import { getManifestoContent, getHomeContent } from "@/lib/cms/loader";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const content = getManifestoContent();
  return {
    title: content.title,
    description: content.intro,
    alternates: { canonical: "/manifesto" },
    openGraph: {
      title: content.title,
      description: content.intro,
      url: "/manifesto",
      type: "website",
    },
  };
}

export default function Page() {
  const content = getManifestoContent();
  const homeContent = getHomeContent();
  return <ManifestoPage content={content} navigation={homeContent.navigation} />;
}
