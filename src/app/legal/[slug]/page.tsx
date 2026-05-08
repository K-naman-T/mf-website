import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/sections/LegalDocumentPage";
import { getLegalDocument, getLegalSlugs } from "@/lib/cms/loader";
import { getLegalDocumentJsonLd, getLegalDocumentMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getLegalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return getLegalDocumentMetadata(slug);
}

export default async function LegalDocumentRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getLegalSlugs().includes(slug)) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getLegalDocumentJsonLd(slug)) }} />
      <LegalDocumentPage document={getLegalDocument(slug)} />
    </>
  );
}
