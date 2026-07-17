import { notFound } from "next/navigation";
import { getLegalSlugs, getLegalDocument, getHomeContent } from "@/lib/cms/loader";
import { LegalPageContent } from "@/components/legal/LegalPageContent";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { getLegalDocumentMetadata } from "@/lib/seo";
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
  if (!getLegalSlugs().includes(slug)) return {};
  return getLegalDocumentMetadata(slug);
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getLegalSlugs().includes(slug)) {
    notFound();
  }

  const document = getLegalDocument(slug);
  const { navigation } = getHomeContent();

  return (
    <LegalPageShell navigation={navigation}>
      <LegalPageContent document={document} />
    </LegalPageShell>
  );
}
