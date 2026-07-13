"use client";

import { marked } from "marked";
import Link from "next/link";
import type { LegalDocument } from "@/lib/cms/types";
import styles from "./legal.module.css";

export function LegalPageContent({ document }: { document: LegalDocument }) {
  const html = marked.parse(document.body);

  return (
    <div className={styles.content}>
      <Link href="/legal" className={styles.backLink}>
        &larr; Back to Legal
      </Link>
      <h1 className={styles.title}>{document.title}</h1>
      {document.lastUpdated && (
        <p className={styles.lastUpdated}>
          Last updated: {document.lastUpdated}
        </p>
      )}
      <div
        className={styles.bodyHtml}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
