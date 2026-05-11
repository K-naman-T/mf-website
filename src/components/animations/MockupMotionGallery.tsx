import styles from "./MockupMotionGallery.module.css";

const cards = [
  {
    eyebrow: "01 / Identity",
    title: "Logo Reveal",
    description: "A direct mark reveal using the actual Metafloor logo asset.",
  },
  {
    eyebrow: "02 / Ambient",
    title: "Signal Field",
    description: "A restrained red field with grid texture and no organic shapes.",
  },
  {
    eyebrow: "03 / CTA",
    title: "Button State",
    description: "Sharp directional state changes without liquid edges.",
  },
  {
    eyebrow: "04 / Routing",
    title: "Page Transition",
    description: "Clean structural motion built around masks and opacity.",
  },
  {
    eyebrow: "05 / Services",
    title: "Service Card",
    description: "Icon, copy, and border states moving as one interface unit.",
  },
  {
    eyebrow: "06 / Navigation",
    title: "OO Blink System",
    description: "The short-logo asset with eyelid compression and rail signals.",
  },
];

export function MockupMotionGallery() {
  return (
    <section className={styles.gallery}>
      {cards.map((card) => (
        <article className={styles.galleryCard} key={card.title}>
          <div className={styles.stage}>
            <span>{card.eyebrow}</span>
            <h2>{card.title}</h2>
          </div>
          <div className={styles.cardInfo}>
            <p>{card.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
