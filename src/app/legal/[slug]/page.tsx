import { getLegalSlugs, getLegalDocument, getHomeContent } from "@/lib/cms/loader";
import { LegalPageContent } from "@/components/legal/LegalPageContent";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getLegalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const document = getLegalDocument(slug);
  return {
    title: document.title,
  };
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = getLegalDocument(slug);
  const { navigation } = getHomeContent();

  return (
    <LegalPageShell navigation={navigation}>
      <LegalPageContent document={document} />
    </LegalPageShell>
  );
}
