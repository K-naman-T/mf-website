import { CmsPage } from "@/components/sections/CmsPage";
import { getPageContent } from "@/lib/cms/loader";

export function CmsRoutePage({ slug }: { slug: string }) {
  return <CmsPage content={getPageContent(slug)} />;
}
