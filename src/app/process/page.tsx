import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("process");

export default function ProcessPage() {
  return <CmsRoutePage slug="process" />;
}
