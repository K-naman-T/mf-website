import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("services");

export default function ServicesPage() {
  return <CmsRoutePage slug="services" />;
}
