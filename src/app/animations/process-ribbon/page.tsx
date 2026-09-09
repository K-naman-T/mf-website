import Link from "next/link";
import { ProcessRibbon } from "@/components/home/process-ribbon/ProcessRibbon";
import { getHomeContent } from "@/lib/cms/loader";
import styles from "./page.module.css";

// Internal lab route (disallowed in robots) for iterating on the vertical
// ribbon process section before it reaches the live homepage.
export default function ProcessRibbonPage() {
  const content = getHomeContent();
  const { process } = content;

  return (
    <main className={styles.page}>
      <nav className={styles.labNav}>
        <Link href="/">← home</Link>
        <span>process ribbon · lab</span>
      </nav>
      <ProcessRibbon
        eyebrow={process.eyebrow}
        title={process.title}
        steps={process.steps}
      />
    </main>
  );
}
