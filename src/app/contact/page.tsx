import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("contact");

export default function ContactPage() {
  return <CmsRoutePage slug="contact" />;
}
