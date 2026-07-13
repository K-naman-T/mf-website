import OfyArtHome from "@/components/home/OfyArtHome";
import { getHomeMetadata } from "@/lib/seo";
import { getHomeContent } from "@/lib/cms/loader";

export const metadata = getHomeMetadata();

export default function HomePage() {
  const content = getHomeContent();
  return <OfyArtHome content={content} />;
}
