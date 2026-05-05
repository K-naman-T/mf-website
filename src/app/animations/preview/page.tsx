import Link from "next/link";
import { MockupMotionGallery } from "@/components/animations";
import styles from "./preview.module.css";

export const metadata = {
  title: "Animation Mockups — Metafloor",
};

export default function AnimationPreview() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← Back to site</Link>
        <h1 className={styles.title}>Animation Mockups</h1>
        <p className={styles.subtitle}>Six production-oriented motion studies based on the boards.</p>
      </header>
      <MockupMotionGallery />
    </main>
  );
}
