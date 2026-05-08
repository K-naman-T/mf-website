import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("capabilities");

export default function CapabilitiesPage() {
  return <CmsRoutePage slug="capabilities" />;
}
