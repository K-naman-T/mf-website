import { Navbar } from "@/components/layout/Navbar";
import { LogoIntro } from "@/components/animations/LogoIntro";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomeSections } from "@/components/sections/HomeSections";
import { getHomeContent } from "@/lib/cms/loader";

export default function HomePage() {
  const content = getHomeContent();

  return (
    <div className="min-h-screen">
      <LogoIntro />
      <Navbar content={content.navigation} />
      <main>
        <HeroSection content={content.hero} />
        <HomeSections content={content} />
      </main>
    </div>
  );
}
