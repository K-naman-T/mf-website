import { LegalIndexPage } from "@/components/sections/LegalIndexPage";
import { getLegalIndex } from "@/lib/cms/loader";
import { getLegalIndexMetadata } from "@/lib/seo";

export const metadata = getLegalIndexMetadata();

export default function LegalPage() {
  return <LegalIndexPage content={getLegalIndex()} />;
}
