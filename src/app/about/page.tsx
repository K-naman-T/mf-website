import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("about");

export default function AboutPage() {
  return <CmsRoutePage slug="about" />;
}
