import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("design");

export default function DesignPage() {
  return <CmsRoutePage slug="design" />;
}
