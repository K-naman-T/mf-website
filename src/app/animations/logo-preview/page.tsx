import { LogoMark } from "@/components/brand/LogoMark";
import { FullLogo } from "@/components/brand/FullLogo";

export default function LogoPreviewPage() {
  return (
    <main className="logo-preview-page">
      <section className="logo-preview-section">
        <h1 className="logo-preview-title">OddFromYou — Logo Preview</h1>

        <div className="logo-preview-grid">
          <div className="logo-preview-card logo-preview-card-light">
            <span className="logo-preview-label">Full Logo — Dark on Light</span>
            <FullLogo variant="dark" className="logo-preview-svg" />
          </div>

          <div className="logo-preview-card logo-preview-card-dark">
            <span className="logo-preview-label">Full Logo — White on Dark</span>
            <FullLogo variant="light" className="logo-preview-svg" />
          </div>

          <div className="logo-preview-card logo-preview-card-red">
            <span className="logo-preview-label">Full Logo — Red on Black</span>
            <FullLogo variant="red" className="logo-preview-svg" />
          </div>

          <div className="logo-preview-card logo-preview-card-light">
            <span className="logo-preview-label">Short Mark — Dark (comparison)</span>
            <LogoMark theme="dark" className="logo-preview-svg logo-preview-svg-short" />
          </div>

          <div className="logo-preview-card logo-preview-card-light">
            <span className="logo-preview-label">Short Mark — Red (comparison)</span>
            <LogoMark theme="red" className="logo-preview-svg logo-preview-svg-short" />
          </div>

          <div className="logo-preview-card logo-preview-card-dark">
            <span className="logo-preview-label">Short Mark — White (comparison)</span>
            <LogoMark theme="light" className="logo-preview-svg logo-preview-svg-short" />
          </div>
        </div>
      </section>
    </main>
  );
}
