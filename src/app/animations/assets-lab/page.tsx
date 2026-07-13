import {
  OFY_ICONS,
  OFY_PLATES,
  OfyIcon,
  OfyPlate,
} from "@/components/brand/OfyAssetKit";

export default function AssetsLabPage() {
  return (
    <main className="assets-lab-page">
      <header className="assets-lab-header">
        <p>OddFromYou Asset Lab</p>
        <h1>Plates and icons.</h1>
        <span>Curate here before anything enters the live site.</span>
      </header>

      <section className="assets-lab-section">
        <div className="assets-lab-section-heading">
          <span>22</span>
          <h2>Plates</h2>
        </div>
        <div className="assets-lab-grid assets-lab-grid-plates">
          {OFY_PLATES.map((id) => (
            <article className="assets-lab-card assets-lab-card-plate" key={id}>
              <OfyPlate id={id} title={`Plate ${id}`} />
              <span>{String(id).padStart(2, "0")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="assets-lab-section">
        <div className="assets-lab-section-heading">
          <span>40</span>
          <h2>Icons</h2>
        </div>
        <div className="assets-lab-grid assets-lab-grid-icons">
          {OFY_ICONS.map((id) => (
            <article className="assets-lab-card assets-lab-card-icon" key={id}>
              <OfyIcon id={id} title={`Icon ${id}`} />
              <span>{String(id).padStart(2, "0")}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
