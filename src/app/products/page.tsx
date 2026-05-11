import { CmsRoutePage } from "@/components/sections/CmsRoutePage";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("products");

export default function ProductsPage() {
  return <CmsRoutePage slug="products" />;
}
