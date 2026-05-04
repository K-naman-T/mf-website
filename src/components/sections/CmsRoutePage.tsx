import { CmsPage } from "@/components/sections/CmsPage";
import { getHomeContent, getPageContent } from "@/lib/cms/loader";

export function CmsRoutePage({ slug }: { slug: string }) {
  return <CmsPage content={getPageContent(slug)} home={getHomeContent()} />;
}
