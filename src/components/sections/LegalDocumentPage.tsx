import Link from "next/link";
import { SectionReveal } from "@/components/motion/transitions/SectionReveal";
import type { LegalDocument } from "@/lib/cms/types";

function inlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MarkdownBlock({ block }: { block: string }) {
  const lines = block.split("\n").filter(Boolean);
  const firstLine = lines[0] ?? "";

  if (firstLine === "---") return null;

  if (firstLine.startsWith("## ")) {
    return <h2>{firstLine.replace(/^##\s+/, "")}</h2>;
  }

  if (firstLine.startsWith("### ")) {
    return <h3>{firstLine.replace(/^###\s+/, "")}</h3>;
  }

  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul>
        {lines.map((line) => (
          <li key={line}>{inlineMarkdown(line.replace(/^-\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  return <p>{inlineMarkdown(lines.join(" "))}</p>;
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const blocks = document.body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="mf-page mf-page-theme mf-legal-page">
      <main className="mf-cms-main">
        <section className="mf-page-hero mf-legal-hero">
          <SectionReveal as="div" className="mf-page-hero-copy" distance={18}>
            <p className="mf-page-eyebrow">★ LEGAL</p>
            <h1 className="mf-page-title">
              <span>{document.title}</span>
            </h1>
          </SectionReveal>
          {document.lastUpdated ? (
            <SectionReveal as="p" className="mf-page-intro" delay={0.06} distance={12}>
              Last updated: {document.lastUpdated}
            </SectionReveal>
          ) : null}
        </section>

        <article className="mf-legal-document">
          <Link href="/legal" className="mf-legal-back">← All legal documents</Link>
          <div className="mf-legal-prose">
            {blocks.map((block, index) => (
              <MarkdownBlock block={block} key={`${document.slug}-${index}`} />
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
