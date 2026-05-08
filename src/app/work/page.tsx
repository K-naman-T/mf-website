import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("work");

export default function WorkPage() {
  return <CmsRoutePage slug="work" />;
}
