import Link from "next/link";
import { getLegalIndex, getHomeContent } from "@/lib/cms/loader";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import styles from "@/components/legal/legal.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Documents",
};

export default function LegalIndexPage() {
  const index = getLegalIndex();
  const { navigation } = getHomeContent();

  return (
    <LegalPageShell navigation={navigation}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{index.hero.eyebrow}</p>
        <h1 className={styles.title}>{index.hero.title.join(" ")}</h1>
        <p className={styles.intro}>{index.hero.intro}</p>
        <div className={styles.indexList}>
          {index.documents.map((doc) => (
            <Link
              key={doc.slug}
              href={`/legal/${doc.slug}`}
              className={styles.indexLink}
            >
              <span className={styles.indexLinkTitle}>{doc.title}</span>
              <span className={styles.indexLinkDesc}>{doc.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </LegalPageShell>
  );
}
