import { CmsPage } from "@/components/sections/CmsPage";
import { getHomeContent, getPageContent } from "@/lib/cms/loader";

export function CmsRoutePage({ slug }: { slug: string }) {
  const home = getHomeContent();
  return <CmsPage content={getPageContent(slug)} ctaLabel={home.navigation.cta.label} ctaHref={home.navigation.cta.href} />;
}
